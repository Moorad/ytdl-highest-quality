# How to install

1. Install [git](https://git-scm.com/) and clone this respiratory by firstly [navigating to your desired directory using cmd](https://riptutorial.com/cmd/example/8646/navigating-in-cmd) and running the following:

   ```
   git clone https://github.com/Moorad/ytdl-highest-quality
   ```

   **or**

   Download the zip file of this respiratory directly from GitHub by clicking the green `Code` button and then clicking `Download ZIP`.  After that extract the zip file to your desired directory.

2. Install [Node](https://nodejs.org/en/), the LTS version preferably. I'm currently using version `12.18.3` which is not the latest LTS version however you shouldn't have any problems with the newer node versions

3. Navigate to the folder you just downloaded/cloned and run:

   ```
   npm install
   ```

   This will install all the necessary modules that this project uses.

4. Lastly run:

   ```
   node index.js
   ```



If you follow all these steps and you get `Server Works !!! At port 4000` in the console then everything is running correctly. Now you have to head to:

````
http://localhost:4000/downloadmp4?url=[The url of the video you want to download]
````

To download the mp4 of the video or use:

```
http://localhost:4000/downloadmp3?url=[The url of the video you want to download]
```

for mp3 e.g. link: 

````
http://localhost:4000/downloadmp4?url=https://www.youtube.com/watch?v=QAUzWtLMnU0
````



You can also use a very simple webpage with an input box to download mp4s by going to `http://localhost:4000/`



For any questions or problems please [open a new issue](https://github.com/Moorad/ytdl-highest-quality/issues/new).