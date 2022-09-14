/*

  A* and Djikstra's path finding algorithm visualization

  Author: Logan Stein
  Sources: https://briangrinstead.com/blog/astar-search-algorithm-in-javascript-updated/, https://www.geeksforgeeks.org/a-search-algorithm/
  Date: 7/30/21
  Version: 2.5

*/
const canvas = document.getElementById("main-canvas");
// make canvas 75% of widht of viewport and 1/2 as high as it is long
canvas.width =
  20 * Math.round((document.documentElement.clientWidth * 0.75) / 20);
canvas.height = 20 * Math.round((canvas.width * 0.5) / 20);

let ctx = canvas.getContext("2d");
let grid;
let startPoint = null;
let endPoint = null;
let coord = { x: 0, y: 0 };
let neighborsList = [];
let speed = 1;
const ROW = canvas.height / 20;
const COL = canvas.width / 20;
const diagonalCost = 14;
const directionChangeCost = 10;
let heuristic = "Manhattan";

function init() {
  //draw vertical lines for grid
  for (let i = 0; i < canvas.width - 20; i += 20) {
    ctx.moveTo(i + 20, 0);
    ctx.lineTo(i + 20, canvas.height);
    ctx.stroke();
  }
  //draw horizontal lines for grid
  for (let j = 0; j < canvas.height - 20; j += 20) {
    ctx.moveTo(0, j + 20);
    ctx.lineTo(canvas.width, j + 20);
    ctx.stroke();
  }
  // create grid object

  grid = new Array(COL);
  for (let i = 0; i < COL; i++) {
    grid[i] = new Array(ROW);
  }
  // the cell object to be assigned to each spot in the grid above
  class Cell {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.startPoint = false;
      this.endPoint = false;
      this.isWall = false;
      this.parent = null;
      this.neighbors = [];
      this.f = 0;
      this.g = 0;
      this.h = 0;
      this.visited = false;
    }
    //setters
    setIsWall(val) {
      this.isWall = val;
    }
    setStartPoint(val) {
      this.startPoint = val;
    }
    setEndPoint(val) {
      this.endPoint = val;
    }
    setVisited() {
      this.visited = true;
    }
  }
  //assign a cell obj with the x,y coord to each spot in the grid
  for (let i = 0; i < COL; i++) {
    for (let j = 0; j < ROW; j++) {
      grid[i][j] = new Cell(i, j);
    }
  }
}

// Helper function to get the coords of the mouse relative to canvas
function getMousePos(evt) {
  return {
    x: evt.pageX - canvas.offsetLeft,
    y: evt.pageY - canvas.offsetTop,
  };
}

// event listener for clicks
canvas.addEventListener("mousedown", (e) => {
  let mousePos = getMousePos(e);

  // dont let user set blocks without choosing block first
  if (getBlockType() == undefined) {
    alert("choose a block type");
    return;
  }
  //event listener so that you can drag to draw for walls
  if (getBlockType() == "wall") {
    canvas.addEventListener("mousemove", draw);
  }
  //helper for drawing single click adding walls
  reposition(e);

  let clickedCell =
    grid[Math.floor(mousePos.x / 20)][Math.floor(mousePos.y / 20)];
  // tell the cell that it's now a wall
  if (getBlockType() == "wall") {
    // lets user delete one wall at a time
    if (clickedCell.isWall) {
      fillBlock("white", clickedCell);
      clickedCell.setIsWall(false);
      return;
    }
    clickedCell.setIsWall(true);
    fillBlock("black", mousePos);
  } else if (getBlockType() == "startPoint") {
    // tell the cell its now the start point
    if (startPoint != null) {
      fillBlock("white", startPoint);
      startPoint.setStartPoint(false);
    }
    fillBlock("green", mousePos);
    clickedCell.setStartPoint(true);
    startPoint = clickedCell;
  } else if (getBlockType() == "endPoint") {
    if (endPoint != null) {
      fillBlock("white", endPoint);
      endPoint.setEndPoint(false);
      endPoint = null;
    }
    fillBlock("red", mousePos);
    clickedCell.setEndPoint(true);
    endPoint = clickedCell;
  }
});

// stop drawing
canvas.addEventListener("mouseup", () => {
  canvas.removeEventListener("mousemove", draw);
});

// helper function for drawing walls
function reposition(e) {
  coord.x = e.pageX - canvas.offsetLeft;
  coord.y = e.pageY - canvas.offsetTop;
}

// draw walls on the canvas
function draw(e) {
  ctx.fillStyle = "black";
  reposition(e);
  ctx.fillRect(
    Math.floor(coord.x / 20) * 20,
    Math.floor(coord.y / 20) * 20,
    20,
    20
  );
  // if(coord.x % 20 == 0 || coord.y%20 == 0){
  let clickedCell = grid[Math.floor(coord.x / 20)][Math.floor(coord.y / 20)];
  // tell each cell that its a wall now
  clickedCell.setIsWall(true);
  // }
}

init();

// helper function to get which type of block we want to place
function getBlockType() {
  var elem = document.getElementsByName("color");
  for (var i = 0; i < elem.length; i++) {
    if (elem[i].checked) {
      return elem[i].value;
    }
  }
}

function fillBlock(blockColor, mousePos) {
  if (
    blockColor == "white" ||
    blockColor == "blue" ||
    blockColor == "orange" ||
    blockColor == "gray" ||
    blockColor == "forestgreen" ||
    blockColor == "crimson"
  ) {
    ctx.fillStyle = blockColor;
    ctx.fillRect(mousePos.x * 20 + 1, mousePos.y * 20 + 1, 18, 18);
    return;
  }
  ctx.fillStyle = blockColor;
  ctx.fillRect(
    Math.floor(mousePos.x / 20) * 20,
    Math.floor(mousePos.y / 20) * 20,
    20,
    20
  );
  ctx.stroke();
}

// reset the board to begining state
function reset() {
  for (let i = 0; i < COL; i++) {
    for (let j = 0; j < ROW; j++) {
      // if(grid[i][j].isWall || grid[i][j].startPoint || grid[i][j].endPoint){
      grid[i][j].setIsWall(false);
      grid[i][j].setStartPoint(false);
      grid[i][j].setEndPoint(false);
      fillBlock("white", grid[i][j]);
      // }
    }
  }
  init();
}

function resetVisited() {
  neighborsList = [];
  for (let i = 0; i < COL; i++) {
    for (let j = 0; j < ROW; j++) {
      grid[i][j].visited = false;
      grid[i][j].f = 0;
      grid[i][j].g = 0;
      grid[i][j].h = 0;
      grid[i][j].parent = null;
      grid[i][j].neighbors = [];
    }
  }
}

function aStar2() {
  diagonals = document.getElementById("diagonals").checked;
  heuristic = document.getElementById("heuristic").value;
  let openList = [];
  let closedList = [];
  let found = false;
  openList.push(startPoint);
  while (openList.length != 0) {
    let q = minF(openList);
    remove(openList, q);
    if (q == endPoint) {
      found = true;
      tracePath(endPoint);
      return;
    }
    closedList.push(q);
    setNeighbors2(q, diagonals); // just add neighboring cells to q's list of neighbors
    q.neighbors.forEach((neighbor) => {
      if (!neighbor.visited) {
        neighbor.parent = q;
        neighbor.g = q.g + 10;
        if (heuristic == "Manhattan") {
          neighbor.h = manhattanHeuristic(neighbor, endPoint);
        }
        if (heuristic == "Euclidian") {
          neighbor.h = euclidianHeuristic(neighbor, endPoint);
        }
        if (heuristic == "Diagonal") {
          neighbor.h = diagonalHeuristic(neighbor, endPoint);
        }
        if (heuristic == "Dijkstra") {
          neighbor.h = 0;
        }
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.setVisited();
        openList.push(neighbor);
      }
      if (openList.includes(neighbor)) {
        let newG = q.g + 10;
        if (neighbor.g > newG) {
          neighbor.g = newG;
          neighbor.f = neighbor.h + neighbor.g;
          neighbor.parent = q;
        }
      }
    });
  }
  if (!found) {
    alert("No Path Found!");
    resetVisited();
  }
}

//set neighbors of a cell
function setNeighbors2(cell, diagonals) {
  // northern neighbor
  if (cell.y != 0) {
    if (!grid[cell.x][cell.y - 1].isWall) {
      cell.neighbors.push(grid[cell.x][cell.y - 1]);
      neighborsList.push(grid[cell.x][cell.y - 1]);
    }
  }
  // north-eastern neighbor
  if (diagonals) {
    if (cell.y != 0 && cell.x != COL - 1) {
      if (!grid[cell.x + 1][cell.y - 1].isWall) {
        cell.neighbors.push(grid[cell.x + 1][cell.y - 1]);
        neighborsList.push(grid[cell.x + 1][cell.y - 1]);
      }
    }
  }
  // eastern neighbor
  if (cell.x != COL - 1) {
    if (!grid[cell.x + 1][cell.y].isWall) {
      cell.neighbors.push(grid[cell.x + 1][cell.y]);
      neighborsList.push(grid[cell.x + 1][cell.y]);
    }
  }
  // south-eastern neighbor
  if (diagonals) {
    if (cell.x != COL - 1 && cell.y != ROW - 1) {
      if (!grid[cell.x + 1][cell.y + 1].isWall) {
        cell.neighbors.push(grid[cell.x + 1][cell.y + 1]);
        neighborsList.push(grid[cell.x + 1][cell.y + 1]);
      }
    }
  }
  // southern neighbor
  if (cell.y != ROW - 1) {
    if (!grid[cell.x][cell.y + 1].isWall) {
      cell.neighbors.push(grid[cell.x][cell.y + 1]);
      neighborsList.push(grid[cell.x][cell.y + 1]);
    }
  }

  // south-western neighbor
  if (diagonals) {
    if (cell.y != ROW - 1 && cell.x != 0) {
      if (!grid[cell.x - 1][cell.y + 1].isWall) {
        cell.neighbors.push(grid[cell.x - 1][cell.y + 1]);
        neighborsList.push(grid[cell.x - 1][cell.y + 1]);
      }
    }
  }

  // Western Neighbor
  if (cell.x != 0) {
    if (!grid[cell.x - 1][cell.y].isWall) {
      cell.neighbors.push(grid[cell.x - 1][cell.y]);
      neighborsList.push(grid[cell.x - 1][cell.y]);
    }
  }
  // North-western Neighbor
  if (diagonals) {
    if (cell.x != 0 && cell.y != 0) {
      if (!grid[cell.x - 1][cell.y - 1].isWall) {
        cell.neighbors.push(grid[cell.x - 1][cell.y - 1]);
        neighborsList.push(grid[cell.x - 1][cell.y - 1]);
      }
    }
  }
}

//find the element with the lowest f score in an array
function minF(arr) {
  let currentMin = arr[0];
  arr.forEach((cell) => {
    // cell.f <= currentMin.f eliminates the block pattern problem. If its just < we get unnecessary zig zagging
    if (cell.f <= currentMin.f) {
      currentMin = cell;
    }
  });
  return currentMin;
}

// return the value for h of the cell using manhattan heuristic
function manhattanHeuristic(cell, endPoint) {
  let h = Math.abs(cell.x - endPoint.x) + Math.abs(cell.y - endPoint.y);
  return h * 10;
}

//return the value of h of the cell using diagonal heuristic
function diagonalHeuristic(cell, endPoint) {
  let dx = Math.abs(cell.x - endPoint.x);
  let dy = Math.abs(cell.y - endPoint.y);
  let D = 1;
  let D2 = Math.sqrt(2);

  let h = D * (dx + dy) + (D2 - 2 * D) * Math.min([dx, dy]);
  return h;
}

// return the value of the h cell using the euclidian heuristic
function euclidianHeuristic(cell, endPoint) {
  let h = Math.sqrt((cell.x - endPoint.x) * 2 + (cell.y - endPoint.y) * 2);
  return h;
}

// color the path the algorithm resulted in
function tracePath(cell) {
  let path = [];
  while (!cell.startPoint) {
    path.push(cell.parent);
    cell = cell.parent;
  }
  animateNeighbors(path);
  console.log("Path taken", path);
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

async function animatePath(path) {
  for (let i = 0; i < path.length; i++) {
    if (!path[i].startPoint) {
      fillBlock("blue", path[i]);
    }
    await timer(speed);
  }
}

async function animateNeighbors(path) {
  for (let i = 0; i < neighborsList.length; i++) {
    const cell = neighborsList[i];
    await timer(speed);
    if (!cell.endPoint && !cell.startPoint) {
      fillBlock("orange", cell);
    }
  }
  animatePath(path);
}

//remove an element from an array
function remove(arr, current) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == current) {
      arr.splice(i, 1);
    }
  }
}

//generat walls with certain frequency
function generateWalls() {
  let wallFreq = document.getElementById("wallFreq");

  if (wallFreq.value == "pattern1") {
    generateMazeWalls1();
    return;
  } else if (wallFreq.value == "pattern2") {
    generateMazeWalls2();
    return;
  } else if (wallFreq.value == "Recursive Division") {
    reset();
    recursiveDivision({ x: 0, y: 0, width: COL, height: ROW });
    return;
  }

  for (let i = 0; i < COL; i++) {
    for (let j = 0; j < ROW; j++) {
      let rand = Math.random(0, 1);
      if (rand <= wallFreq.value) {
        grid[i][j].setIsWall(true);
        ctx.fillStyle = "black";
        ctx.fillRect(i * 20, j * 20, 20, 20);
        ctx.stroke();
      } else {
        grid[i][j].setIsWall(false);
        fillBlock("white", grid[i][j]);
      }
    }
  }
}

function run() {
  aStar2();
  // recursiveDivision();
  // getVisited();
}

// generate pattern 1 wall pattern
async function generateMazeWalls1() {
  reset();
  grid[0][0].setStartPoint(true);
  startPoint = grid[0][0];

  grid[33][0].setEndPoint(true);
  endPoint = grid[33][0];

  for (let j = 0; j < 19; j++) {
    grid[1][j].setIsWall(true);
    grid[5][j].setIsWall(true);
    grid[13][j].setIsWall(true);
  }
  for (let j = 1; j < 20; j++) {
    grid[3][j].setIsWall(true);
    grid[11][j].setIsWall(true);
    grid[15][j].setIsWall(true);
    grid[30][j].setIsWall(true);
  }

  for (let i = 6; i < 10; i++) {
    grid[i][2].setIsWall(true);
    grid[i][6].setIsWall(true);
    grid[i][10].setIsWall(true);
    grid[i][14].setIsWall(true);
    grid[i][18].setIsWall(true);
  }

  for (let i = 7; i < 11; i++) {
    grid[i][4].setIsWall(true);
    grid[i][8].setIsWall(true);
    grid[i][12].setIsWall(true);
    grid[i][16].setIsWall(true);
  }

  for (let i = 16; i < 25; i++) {
    grid[i][1].setIsWall(true);
    grid[i][5].setIsWall(true);
    grid[i][9].setIsWall(true);
  }

  for (let i = 17; i < 26; i++) {
    grid[i][3].setIsWall(true);
    grid[i][7].setIsWall(true);
    grid[i][11].setIsWall(true);
  }

  for (let i = 0; i < 12; i++) {
    grid[26][i].setIsWall(true);
  }

  for (let j = 11; j < 19; j++) {
    grid[17][j].setIsWall(true);
    grid[21][j].setIsWall(true);
  }

  for (let j = 13; j < 20; j++) {
    grid[19][j].setIsWall(true);
  }

  for (let i = 22; i < 29; i++) {
    grid[i][14].setIsWall(true);
    grid[i][18].setIsWall(true);
  }

  for (let i = 23; i < 30; i++) {
    grid[i][16].setIsWall(true);
  }

  for (let i = 27; i < 29; i++) {
    grid[i][2].setIsWall(true);
    grid[i][6].setIsWall(true);
    grid[i][10].setIsWall(true);
  }

  for (let i = 28; i < 30; i++) {
    grid[i][4].setIsWall(true);
    grid[i][8].setIsWall(true);
    grid[i][12].setIsWall(true);
  }

  for (let j = 0; j < 19; j++) {
    if (j != 6 && j != 8) {
      grid[32][j].setIsWall(true);
    }
  }

  for (let i = 31; i < 37; i++) {
    grid[i][7].setIsWall(true);
  }

  for (let i = 33; i < 39; i++) {
    grid[i][1].setIsWall(true);
    grid[i][5].setIsWall(true);
    grid[i][9].setIsWall(true);
    grid[i][14].setIsWall(true);
    grid[i][18].setIsWall(true);
  }

  for (let i = 34; i < 40; i++) {
    grid[i][3].setIsWall(true);
    grid[i][12].setIsWall(true);
    grid[i][16].setIsWall(true);
  }

  for (let j = 5; j < 10; j++) {
    grid[38][j].setIsWall(true);
  }

  for (let i = 0; i < COL; i++) {
    for (let j = 0; j < ROW; j++) {
      if (grid[i][j].isWall) {
        fillBlock("gray", grid[i][j]);
        await timer(5);
      }
      if (grid[i][j].startPoint) {
        fillBlock("forestgreen", grid[i][j]);
        await timer(5);
      }
      if (grid[i][j].endPoint) {
        fillBlock("crimson", grid[i][j]);
        await timer(5);
      }
    }
  }
}

// generate pattern 2 wall pattern
async function generateMazeWalls2() {
  reset();
  grid[0][0].setStartPoint(true);
  startPoint = grid[0][0];
  grid[39][18].setEndPoint(true);
  endPoint = grid[39][18];
  //horizontal lines
  for (let i = 0; i < COL; i++) {
    for (let j = 1; j < ROW; j += 2) {
      //first line
      if (j == 1) {
        if (i != 5 && i != 15 && i != 25 && i != 35 && i != 39) {
          grid[i][j].setIsWall(true);
        }
      } else if (j == 3) {
        // second line
        if (i != 14 && i != 23 && i != 29 && i != 39) {
          grid[i][j].setIsWall(true);
        }
      } else if (j == 5) {
        //   third line
        if (i != 0 && i != 10 && i != 19 && i != 29 && i != 34) {
          grid[i][j].setIsWall(true);
        }
      } else if (j == 7) {
        //   fourth line
        if (i != 0 && i != 24) {
          grid[i][j].setIsWall(true);
        }
      } else if (j == 9) {
        //   fifth line
        if (i != 5 && i != 14 && i != 35) {
          grid[i][j].setIsWall(true);
        }
      } else if (j == 11) {
        //   sixth line
        if (i != 0 && i != 9 && i != 24) {
          grid[i][j].setIsWall(true);
        }
      } else if (j == 13) {
        //   seventh line
        if (i != 0 && i != 9 && i != 14 && i != 20 && i != 30) {
          grid[i][j].setIsWall(true);
        }
      } else if (j == 15) {
        //   eighth line
        if (i != 14 && i != 24 && i != 38) {
          grid[i][j].setIsWall(true);
        }
      } else if (j == 17) {
        //   ninth line
        if (i != 1 && i != 5 && i != 20 && i != 24 && i != 30) {
          grid[i][j].setIsWall(true);
        }
      } else {
        grid[i][j].setIsWall(true);
      }
    }
  }

  //   vertical lines
  for (let i = 2; i < COL; i += 5) {
    for (let j = 0; j < ROW; j++) {
      if (i == 2) {
        if (j != 0 && j != 4 && j != 8 && j != 10 && j != 14 && j != 16) {
          grid[i][j].setIsWall(true);
        }
      } else if (i == 7) {
        if (j != 2 && j != 4 && j != 8 && j != 14 && j != 16 && j != 18) {
          grid[i][j].setIsWall(true);
        }
      } else if (i == 12) {
        if (j != 2 && j != 6 && j != 10 && j != 16 && j != 18) {
          grid[i][j].setIsWall(true);
        }
      } else if (i == 17) {
        if (j != 0 && j != 2 && j != 6 && j != 8 && j != 12 && j != 18) {
          grid[i][j].setIsWall(true);
        }
      } else if (i == 22) {
        if (j != 0 && j != 4 && j != 8 && j != 14) {
          grid[i][j].setIsWall(true);
        }
      } else if (i == 27) {
        if (j != 2 && j != 8 && j != 10 && j != 12 && j != 16) {
          grid[i][j].setIsWall(true);
        }
      } else if (i == 32) {
        if (
          j != 0 &&
          j != 2 &&
          j != 6 &&
          j != 8 &&
          j != 10 &&
          j != 14 &&
          j != 16 &&
          j != 18
        ) {
          grid[i][j].setIsWall(true);
        }
      } else if (i == 37) {
        if (
          j != 0 &&
          j != 4 &&
          j != 6 &&
          j != 10 &&
          j != 14 &&
          j != 16 &&
          j != 18
        ) {
          grid[i][j].setIsWall(true);
        }
      } else {
        grid[i][j].setIsWall(true);
      }
    }
  }

  //   paint
  for (let i = 0; i < COL; i++) {
    for (let j = 0; j < ROW; j++) {
      if (grid[i][j].isWall) {
        fillBlock("gray", grid[i][j]);
        await timer(5);
      }
      if (grid[i][j].startPoint) {
        fillBlock("forestgreen", grid[i][j]);
        await timer(5);
      }
      if (grid[i][j].endPoint) {
        fillBlock("crimson", grid[i][j]);
        await timer(5);
      }
    }
  }
}

function getVisited() {
  let visited = [];
  for (let i = 0; i < COL; i++) {
    for (let j = 0; j < ROW; j++) {
      if (grid[i][j].visited) {
        visited.push(grid[i][j]);
      }
    }
  }
  console.log(visited);
}

function randomDivider(min, max, vertical) {
  if (vertical) {
    if (max > COL) {
      max = COL - 1;
    }
    if (min >= COL) {
      min = COL - 1;
    }
  } else {
    if (max > ROW) {
      max = ROW - 1;
    }
    if (min >= ROW) {
      min = COL - 1;
    }
  }
  // console.log("Min, max", min, max);
  let divider = Math.round(Math.random() * (max - min) + min);
  // let divider = Math.round((max - min) / 2 + min);
  // console.log(divider);
  return divider;
}

function fillWall(x, y) {
  ctx.fillStyle = "black";
  ctx.fillRect(x * 20, y * 20, 20, 20);
  ctx.stroke();
}

function randomException(min, max) {
  max -= 1;
  return Math.round(Math.random() * (max - min) + min);
}

function wallCheck(divider, start, vertical) {
  // console.log("COL: ", COL);
  // console.log(divider);
  if (vertical) {
    if (divider < COL - 1) {
      if (grid[divider + 1][start].isWall) {
        return true;
      }
      if (divider != 0) {
        if (grid[divider - 1][start].isWall) {
          return true;
        }
      }
      if (grid[divider][start].isWall) {
        return true;
      }
    }
  } else {
    if (divider < ROW - 1) {
      if (divider != ROW) {
        if (grid[start][divider + 1].isWall) {
          return true;
        }
        if (divider != 0) {
          if (grid[start][divider - 1].isWall) {
            return true;
          }
        }
        if (grid[start][divider].isWall) {
          return true;
        }
      }
    }
  }
  return false;
}

let count = 0;
lines = [];

function showBox(area) {
  for (let i = 0; i < COL; i++) {
    for (let j = 0; j < ROW; j++) {
      if (!grid[i][j].isWall) {
        ctx.fillStyle = "white";
        ctx.fillRect(i * 20, j * 20, 20, 20);
        ctx.stroke();
      }
    }
  }
  for (let i = area.x; i < area.width; i++) {
    for (let j = area.y; j < area.height; j++) {
      if (!grid[i][j].isWall) {
        ctx.fillStyle = "orange";
        ctx.fillRect(i * 20, j * 20, 20, 20);
        ctx.stroke();
      }
    }
  }
}

function getWidth(start, y, vertical) {
  let i = start;
  let width = 0;
  // console.log(grid[i][y]);
  if (vertical) {
    while (!grid[i][y].isWall && i < COL - 1) {
      i++;
      width++;
    }
  }
  return width;
}

let recursions = 0;
function recursiveDivision(area) {
  if (area.width < 2 || area.height < 2) {
    return;
  }
  console.log("recursion depth", recursions);
  showBox(area);
  // area.width > area.height
  if (true) {
    // divide vertically
    // pick a random location to divide at between start and end of area  width
    let divisionPoint = randomDivider(area.x, area.width + area.x, true);
    console.log("width", area.width);
    while (wallCheck(divisionPoint, area.y, true)) {
      divisionPoint = randomDivider(area.x, area.width + area.x, true);
      console.log("wall next to wall");
      if (area.width <= 3) {
        return;
      }
    }
    // pick a location for the hole in the wall
    let exceptionPoint = randomException(area.y, area.height + area.y);
    // console.log(exceptionPoint);
    // draw dividing line
    for (let i = 0; i < area.height; i++) {
      if (i != exceptionPoint) {
        fillWall(divisionPoint, i);
        grid[divisionPoint][i].setIsWall(true);
      }
    }
    // select areas to divide next
    let leftArea = {
      x: area.x,
      y: area.y,
      width: getWidth(area.x, area.y, true),
      height: area.height,
    };
    let temp = area.width + area.x;
    let rightArea = {
      x: divisionPoint + 1,
      y: area.y,
      width: getWidth(divisionPoint + 1, area.y, true),
      height: area.height,
    };
    // recurse
    console.log("left");
    recursions++;
    recursiveDivision(leftArea);
    recursions--;
    console.log("right");
    recursions++;
    recursiveDivision(rightArea);
    recursions--;
    // area.height > area.width
  } else if (area.height > area.width) {
    // divide horizontally
    // pick a random location to divide at between start and end of area height
    let divisionPoint = randomDivider(area.y, area.height + area.y, false);
    // pick a location for the hole in the wall
    let exceptionPoint = randomException(area.x, area.width + area.x);
    // draw dividing line
    for (let i = 0; i < area.width; i++) {
      if (i != exceptionPoint) {
        fillWall(i, divisionPoint);
        grid[i][divisionPoint].setIsWall(true);
      }
    }
    let topArea = {
      x: area.x,
      y: area.y,
      width: area.width,
      height: divisionPoint - area.y,
    };
    let temp = area.y + area.height;
    let bottomArea = {
      x: area.x,
      y: divisionPoint,
      width: area.width,
      height: temp - divisionPoint,
    };
    recursiveDivision(topArea);
    recursiveDivision(bottomArea);
  }
}
