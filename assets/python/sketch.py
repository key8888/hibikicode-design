import js

current = None


def sketch(p):
    def setup():
        canvas = p.createCanvas(720, 420)
        canvas.parent("design-canvas")
        p.background(20)
        p.noStroke()

    def draw():
        p.fill(0, 0, 0, 22)
        p.rect(0, 0, p.width, p.height)
        p.fill(96, 165, 250)
        p.circle(p.mouseX, p.mouseY, 34)
        p.fill(248, 250, 252)
        p.textSize(22)
        p.textAlign(p.CENTER, p.CENTER)
        p.text("Python + p5.js", p.width / 2, p.height / 2)

    p.setup = setup
    p.draw = draw


def start_sketch(event=None):
    global current
    if current is not None:
        try:
            current.remove()
        except Exception:
            pass
    current = js.p5.new(sketch)


def reset_sketch(event=None):
    if current is not None:
        try:
            current.background(20)
        except Exception:
            pass


js.startSketch = start_sketch
js.resetSketch = reset_sketch

start_sketch()
