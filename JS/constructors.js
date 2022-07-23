export class song {
    constructor(name, singer, path, image) {
      this.name = name;
      this.singer = singer;
      this.path = path;
      this.image = image;
    }
};

export class task {
    constructor(textContent, isDone, index){
        this.textContent = textContent;
        this.isDone = isDone;
        this.index = index;
    }
}