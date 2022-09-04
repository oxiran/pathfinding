import './index.css';


const START_COLOR = '#4A81FE';
const END_COLOR = '#E6AD17';
const SEARCH_COLOR = '#ADD9C3';
const ROAD_COLOR = '#00994C';
const NORMAL_COLOR = '#E1E3E6';

// 创建点集合
function createPoints() {
  const points = [];
  for (let i = 0; i < 30; i += 1) {
    for (let j = 0; j < 50; j += 1) {
      points.push({ id: `${j}-${i}`, x: j, y: i });
    }
  }
  points.forEach((point) => {
    // o 障碍物   r 路径
    point.type = Math.random() > 0.22 ? 'r' : 'o';
  })
  return points;
}

// 创建地图
function createMap(points) {
  const mapDom = document.querySelector('#map');
  mapDom.innerHTML = '';
  const mapContext = points.reduce((total, current) => {
    return `${total}
    <div 
      id="item-${current.id}" 
      data-id="${current.id}"
      data-x="${current.x}"
      data-y="${current.y}"
      data-type="${current.type}"
      class="map__item map__item_${current.type}" 
      style="top: ${current.y * 20}px; left: ${current.x * 20}px;"
    ></div>`
  }, '');
  mapDom.innerHTML = mapContext;
}

// 设置路径点颜色
function setPointColor(pointId, color) {
  const pointDom = document.querySelector(`#item-${pointId}`);
  pointDom.style.backgroundColor = color;
}

function resetRoadColor(points) {
  points.forEach((point) => {
    if (point.type === 'r') {
      setPointColor(point.id, NORMAL_COLOR);
    }
  })
}

function setListColorAnimate(list, color, delay) {
  return new Promise((resolve, reject) => {
    if (!list) {
      reject()
    } else {
      let index = 0;
      const timer = setInterval(() => {
        if (index < list.length) {
          setPointColor(list[index].id, color);
          index += 1;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, delay);
    }
  })
}

function getPath(list) {
  const path = [];
  let pathEnd = list[list.length - 1];
  while (pathEnd) {
    path.unshift(pathEnd);
    pathEnd = pathEnd.parent;
  }
  return path;
}

// 获取两点间的曼哈顿距离
function getManhattanDis(point1, point2) {
  return Math.abs(point2.x - point1.x) + Math.abs(point2.y - point1.y) - 1;
}

// 获取当前点四周（上下左右）的点
function getAroundPoints(current, points) {
  return points.filter((point) => {
    return (
      point.id === `${current.x}-${current.y - 1}`
      || point.id === `${current.x + 1}-${current.y}`
      || point.id === `${current.x}-${current.y + 1}`
      || point.id === `${current.x - 1}-${current.y}`)
      && point.type === 'r';
  });
}

// Breadth First Search 广度优先算法
function searchingByBFS(start, end, points) {
  const openList = []; // 需要检索的点的 list
  const closeList = []; // 已经检索过的点的 list

  start.parent = null; // 指向，用来确定最终路径
  openList.push(start);

  while (openList.length) {
    const current = openList[0];

    if (current.id === end.id) {
      closeList.push(current);
      break;
    };

    getAroundPoints(current, points).forEach((point) => {
      if (
        !closeList.find((closeItem) => closeItem.id === point.id)
        && !openList.find((openItem) => openItem.id === point.id)
      ) {
        openList.push({
          ...point,
          parent: current,
        })
      }
    });

    // 把当前检索的点从 openList 添加到 closeList 中
    const currentIndex = openList.findIndex((openItem) => openItem.id === current.id);
    openList.splice(currentIndex, 1);
    closeList.push(current);
  }

  if (!openList.length && !closeList.find((c) => c.id === end.id)) {
    window.alert('该终点不可到达，请重新选择！');
    return [];
  }

  return closeList;
}

// Dijkstra 算法
function searchingByDijkstra(start, end, points) {
  const openList = [];
  const closeList = [];

  start.cost = 0;
  start.parent = null;
  openList.push(start);

  while (openList.length) {
    const current = openList.sort((a, b) => a.cost - b.cost)[0];
    if (current.id === end.id) {
      closeList.push(current);
      break;
    }

    getAroundPoints(current, points).forEach((point) => {
      if (!closeList.find((closeItem) => closeItem.id === point.id)) {

        const target = openList.find((openItem) => openItem.id === point.id);
        if (!target) {
          openList.push({
            ...point,
            cost: current.cost + 1,
            parent: current,
          })
        } else if (target.cost > current.cost + 1) {
          target.cost = current.cost + 1;
        }
      }
    })

    const currentIndex = openList.findIndex((openItem) => openItem.id === current.id);
    openList.splice(currentIndex, 1);
    closeList.push(current);
  }

  if (!openList.length && !closeList.find((c) => c.id === end.id)) {
    window.alert('该终点不可到达，请重新选择！');
    return [];
  }

  return closeList;
}

// greedy 贪婪算法
function searchingByGreedy(start, end, points) {
  const openList = [];
  const closeList = [];

  start.cost = getManhattanDis(end, start);
  start.parent = null;
  openList.push(start);

  while (openList.length) {
    const current = openList.sort((a, b) => a.cost - b.cost)[0];

    // 如果当前的点为终点则退出循环
    if (current.id === end.id) {
      closeList.push(current);
      break;
    };

    getAroundPoints(current, points).forEach((point) => {

      if (!closeList.find((closeItem) => closeItem.id === point.id)) {
        const target = openList.find((openItem) => openItem.id === point.id);
        if (!target) {
          openList.push({
            ...point,
            cost: getManhattanDis(point, end),
            parent: current,
          });
        }
      }
    })

    const currentIndex = openList.findIndex((openItem) => openItem.id === current.id);
    openList.splice(currentIndex, 1);
    closeList.push(current);
  }

  if (!openList.length && !closeList.find((c) => c.id === end.id)) {
    window.alert('该终点不可到达，请重新选择！');
    return [];
  }

  return closeList;
}

// A* 寻路算法 f(n) = g(n) + h(n)   由于存在评估函数，在有障碍物时路径不一定是最短
function searchingByAStar(start, end, points) {
  const openList = [];
  const closeList = [];

  start.g = 0;
  start.h = getManhattanDis(end, start);
  start.f = start.g + start.h;
  start.parent = null;
  openList.push(start);

  while (openList.length) {
    // 获取最小代价的点为当前需要检索的点
    const current = openList.sort((a, b) => a.f - b.f)[0];

    // 如果当前的点为终点则退出循环
    if (current.id === end.id) {
      closeList.push(current);
      break;
    };

    getAroundPoints(current, points).forEach((point) => {
      if (!closeList.find((closeItem) => closeItem.id === point.id)) {

        // 如果不在 openList 则加入，在的话根据代价大小更新代价及 parent
        const target = openList.find((openItem) => openItem.id === point.id);
        if (!target) {
          openList.push({
            ...point,
            g: current.g + 1,
            h: getManhattanDis(end, point),
            f: current.g + 1 + getManhattanDis(end, point),
            parent: current,
          });
        } else if (target.f > current.g + 1 + getManhattanDis(end, point)) {
          target.g = current.g + 1;
          target.h = getManhattanDis(end, point);
          target.f = target.g + target.h;
          target.parent = current;
        }
      }
    });

    const currentIndex = openList.findIndex((openItem) => openItem.id === current.id);
    openList.splice(currentIndex, 1);
    closeList.push(current);
  }

  if (!openList.length && !closeList.find((c) => c.id === end.id)) {
    window.alert('该终点不可到达，请重新选择！');
    return [];
  }

  return closeList;
}


(function () {
  let points = []; // 地图点的集合
  let start = null; // 起点
  let end = null; // 终点
  let isFinding = false; // 是否在寻路

  let currentAlgorithm = 'astar';
  let showStep = 'yes';

  points = createPoints();
  createMap(points);

  const resetBtn = document.querySelector('#reset-map');
  resetBtn.addEventListener('click', () => {
    if (isFinding) return;

    start = null;
    end = null;
    points = createPoints();
    createMap(points);
  });

  const mapDom = document.querySelector('#map');
  mapDom.addEventListener('click', async (e) => {
    const { dataset } = e.target;

    if (isFinding || dataset.type === 'o') return;

    if (!start && !end) {
      start = { id: dataset.id, x: Number(dataset.x), y: Number(dataset.y) };
      setPointColor(start.id, START_COLOR)
    } else if (start && !end) {
      end = { id: dataset.id, x: Number(dataset.x), y: Number(dataset.y) };
      setPointColor(end.id, END_COLOR);

      isFinding = true;

      let searched = null;
      switch (currentAlgorithm) {
        case 'breadth':
          searched = searchingByBFS(start, end, points);
          break;
        case 'dijkstra':
          searched = searchingByDijkstra(start, end, points);
          break;
        case 'greedy':
          searched = searchingByGreedy(start, end, points);
          break;
        default:
          searched = searchingByAStar(start, end, points);
          break;
      }

      if (!searched.length) {
        isFinding = false;
      } else {
        if (showStep === 'yes') {
          await setListColorAnimate(searched.filter((item) => item.id !== start.id && item.id !== end.id), SEARCH_COLOR, 10);
        }
        const path = getPath(searched);
        await setListColorAnimate(path.filter((item) => item.id !== start.id && item.id !== end.id), ROAD_COLOR, 20);
        isFinding = false;
      }
    } else if (start && end) {
      resetRoadColor(points);

      start = { id: dataset.id, x: Number(dataset.x), y: Number(dataset.y) };
      setPointColor(start.id, START_COLOR);
      end = null;
    }
  })

  document.querySelectorAll('.algorithm').forEach((dom) => {
    dom.addEventListener('change', () => {
      currentAlgorithm = dom.id;
    })
  })

  document.querySelectorAll('.search-step').forEach((dom) => {
    dom.addEventListener('change', () => {
      showStep = dom.id;
    })
  })
})()