class WalkingDog {
    constructor(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = 200;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.dogPictures = [];
        // 图片目录
        this.IMG_PATH = "./images";
        this.IMG_COUNT = 8;
        // 当前画的图片索引
        this.keyFrameIndex = -1;
        // 记录上一帧的时间
        this.lastWalkingTime = Date.now();
        this.dog = {
            // 一步10px
            stepDistance: 10,
            // 狗的速度
            speed: 0.15,
            // 鼠标的x坐标
            mouseX: -1,
            // 往前走停留的位置
            frontStopX: -1,
            // 往回走停留的位置,
            backStropX: window.innerWidth
        };
        this.currentX = 0;
    }

    /**
     * 初始化函数
     */
    async init() {
        await this._loadResources();
        this.pictureWidth = this.dogPictures[0].naturalWidth / 2;
        this.recordMousePosition();

        window.requestAnimationFrame(this._walk.bind(this));
    }
    /**
     * 加载静态资源
     */
    _loadResources() {
        let imagePath = [];
        for (let i = 0; i <= this.IMG_COUNT; i++) {
            imagePath.push(`${this.IMG_PATH}/${i}.png`);
        }

        let works = [];
        imagePath.forEach(imgSrc => {
            works.push(
                new Promise(resolve => {
                    let img = new Image();
                    img.onload = function() {
                        resolve(img);
                    };
                    img.src = imgSrc;
                })
            );
        });

        return new Promise(resolve => {
            Promise.all(works).then(dogPictures => {
                this.dogPictures = dogPictures;
                resolve();
            });
        });
    }
    /**
     * 小狗走动效果
     */
    _walk() {
        let now = Date.now();
        let interval = now - this.lastWalkingTime; // 距离上次渲染的时间间隔

        if (interval > 100) {
            // 清空画布

            this.keyFrameIndex = ++this.keyFrameIndex % this.IMG_COUNT;
            let direct = -1, // 方向，1：正，-1：负
                stopWalking = false;

            // 如果鼠标在狗的前面则往前走
            if (this.dog.frontStopX > this.dog.mouseX) {
                direct = 1;
            } else if (this.dog.backStropX < this.dog.mouseX) {
                // 如果鼠标在狗的后面则往回走
                direct = -1;
            } else {
                // 如果鼠标在狗身上
                stopWalking = true;
                // 如果鼠标在小狗图片中间的右边，则direct为正，否则为负
                direct =
                    this.dog.backStropX - this.dog.mouseX >
                    this.pictureWidth / 2
                        ? 1
                        : -1;
                this.keyFrameIndex = -1;
            }

            if (!stopWalking) {
                this.dog.mouseX += this.dog.stepDistance * direct;
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.save();

            if (direct === -1) {
                // 左右翻转绘制
                this.ctx.scale(direct, 1);
            }

            let img = this.dogPictures[this.keyFrameIndex + 1];
            let drawX = 0;
            // 左右翻转绘制的位置需要计算一下
            drawX =
                this.dog.mouseX * direct -
                (direct === -1 ? this.pictureWidth : 0);

            // 如果移动的距离小于小狗一步的距离，则不更新下一张图片
            let distance = interval * this.dog.speed;
            if (distance < this.dog.stepDistance) {
                window.requestAnimationFrame(this._walk.bind(this));
                return;
            }

            this.ctx.drawImage(
                img,
                0,
                0,
                img.naturalWidth,
                img.naturalHeight,
                drawX,
                16,
                img.naturalWidth / 2,
                img.naturalHeight / 2
            );

            this.ctx.restore();

            this.lastWalkingTime = Date.now();
        }

        window.requestAnimationFrame(this._walk.bind(this));
    }
    /**记录鼠标当前位置的x坐标 */
    recordMousePosition() {
        window.addEventListener("mousemove", e => {
            this.dog.frontStopX = e.clientX - this.pictureWidth;
            this.dog.backStropX = e.clientX;
        });
    }
}
