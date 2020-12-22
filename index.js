const childProcess = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');

const tracker = {
	start: Date.now(),
	audio: {
		downloaded: 0,
		total: Infinity
	},
	video: {
		downloaded: 0,
		total: Infinity
	},
	merged: {
		frame: 0,
		speed: '0x',
		fps: 0
	},
};

if (!fs.existsSync('./output')) {
	fs.mkdirSync('output');
} else {
	fs.readdir('./output', (err, files) => {
		if (err) throw err;

		for (const file of files) {
			fs.unlink(path.join('./output', file), err => {
				if (err) throw err;
			});
		}
	});
}

const app = express();

app.use(cors());

app.listen(4000, () => {
	console.log('Server Works !!! At port 4000');
});


app.get('/', (req, res, next) => {
	res.sendFile(path.resolve(__dirname, './index.html'));
});

app.get('/downloadmp3', async (req, res, next) => {

	const url = req.query.url;

	var title = 'audio_file';
	ytdl.getBasicInfo(url).then((info) => {

		title = info.player_response.videoDetails.title;

		res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);

		const audio = ytdl(url, {
				quality: 'highestaudio'
			})
			.on('progress', (_, downloaded, total) => {
				tracker.audio = {
					downloaded,
					total
				};
			}).pipe(res, {
				end: true
			});

		audio.on('close', () => {
			console.log('done');

			res.sendFile(path.resolve(__dirname, './output/' + title + '.mp3'), () => {
				res.end();
			});
		});
	}).catch((err) => {
		console.error(err);
	})
});

app.get('/downloadmp4', async (req, res, next) => {

	var url = req.query.url;

	let title = 'video_file'
	ytdl.getBasicInfo(url).then((info) => {

		title = info.player_response.videoDetails.title;


		const audio = ytdl(url, {
				quality: 'highestaudio'
			})
			.on('progress', (_, downloaded, total) => {
				tracker.audio = {
					downloaded,
					total
				};
			});

		const video = ytdl(url, {
				quality: 'highestvideo'
			})
			.on('progress', (_, downloaded, total) => {
				tracker.video = {
					downloaded,
					total
				};
			});


		let progressbarHandle = null;
		const progressbarInterval = 1000;
		const showProgress = () => {
			readline.cursorTo(process.stdout, 0);
			const toMB = i => (i / 1024 / 1024).toFixed(2);

			process.stdout.write(`Audio  | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `);
			process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);

			process.stdout.write(`Video  | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `);
			process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);

			process.stdout.write(`Merged | processing frame ${tracker.merged.frame} `);
			process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);

			process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
			readline.moveCursor(process.stdout, 0, -3);
		};

		const ffmpegProcess = childProcess.spawn(ffmpeg, [
			'-loglevel', '8', '-hide_banner',
			'-progress', 'pipe:3',
			'-i', 'pipe:4',
			'-i', 'pipe:5',
			'-map', '0:a',
			'-map', '1:v',
			'-c:v', 'copy',
			'./output/' + title + '.mp4',
		], {
			windowsHide: true,
			stdio: [
				'inherit', 'inherit', 'inherit',
				'pipe', 'pipe', 'pipe',
			],
		});

		ffmpegProcess.on('close', () => {
			console.log('done');

			process.stdout.write('\n\n\n\n');
			clearInterval(progressbarHandle);

			res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
			res.sendFile(path.resolve(__dirname, './output/' + title + '.mp4'), () => {
				res.end();
				fs.unlink(path.join('./output', title + '.mp4'), err => {
					if (err) throw err;
				});
			});
		});

		ffmpegProcess.stdio[3].on('data', chunk => {
			if (!progressbarHandle) progressbarHandle = setInterval(showProgress, progressbarInterval);
			const lines = chunk.toString().trim().split('\n');
			const args = {};
			for (const l of lines) {
				const [key, value] = l.split('=');
				args[key.trim()] = value.trim();
			}
			tracker.merged = args;
		});
		audio.pipe(ffmpegProcess.stdio[4], {
			end: true
		});
		video.pipe(ffmpegProcess.stdio[5], {
			end: true
		});
	}).catch((err) => {
		console.error(err);
	})
});