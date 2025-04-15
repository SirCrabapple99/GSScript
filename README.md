this whole thing can't use es imports or anything of the sort because of CORS restrictions, so everything is a pretty janky mess. Because of this, it uses the original cannon, three js version 1.60.1, and the latest three js plugin version it can (usually ~1.47.0).
all model files need to be turned into js files and then the obj data needs to be turned into a variable using ` or it can't be loaded

normal link: https://sircrabapple99.github.io/three
controls: click to lock mouse, move mouse to move camera, wasd and space to move player, e to pick things up.

hitbox maker: https://sircrabapple99.github.io/three/hitbox.html
controls: click object to select it, wasd to move cam, space and y to move cam up/down, tfgh to rotate cam, arrow keys to move selected object, ijkl to rotate it, u and o to rotate it left and right, . and / to move it up and down v to reset object rotation and position to center, e to switch between global and local rotation axis, axis defaults to global.

level maker: https://sircrabapple99.github.io/three/hitbox.html
same controls as hitbox makers
