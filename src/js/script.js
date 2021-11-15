function testWebP(callback) {
  var webP = new Image();
  webP.onload = webP.onerror = function () {
    callback(webP.height == 2);
  };
  webP.src =
    "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}
testWebP(function (support) {
  if (support == true) {
    document.querySelector("body").classList.add("webp");
  } else {
    document.querySelector("body").classList.add("no-webp");
  }
});

// Grid gallery

const galleryGridSizer = document.querySelector("#gallery-grid-sizer");
const galleryGrid = document.querySelector(".gallery-grid");

const setSizeGridCard = (value) => {
  galleryGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${value}%, 1fr))`;

  if(value == 10) galleryGrid.querySelectorAll(".gallery-grid-item,.exit-folder").forEach(item => {
    item.style.borderColor = "transparent";
  });
  else galleryGrid.querySelectorAll(".gallery-grid-item,.exit-folder").forEach(item => {
    item.style.borderColor = "#444";
    item.style.borderLeftColor = "transparent";
    item.style.borderTopColor = "transparent";
  });

  if(galleryGrid.querySelector(".exit-folder")) {
    if(value > 50) {
      galleryGrid.querySelector(".exit-folder").style.height = galleryGrid.querySelector(".gallery-grid-item").offsetHeight + "px";
    } else {
      galleryGrid.querySelector(".exit-folder").style.height = "auto";
    }
  }
};

const truncateTitle = (title, fontSize) => {
  const {width: maxWidthSymbol} = getTextWidth("w", `500, ${fontSize} OpenSans`);
  const titleObj = {
    width: title.clientWidth - 20,
    content: title.dataset.title.trim()
  };

  function getTextWidth(text, font) {
      // re-use canvas object for better performance
      var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
      var context = canvas.getContext("2d");
      context.font = font;
      var metrics = context.measureText(text);
      return {
        width: metrics.width,
        length: text.length
      };
  }

  let realText = getTextWidth(titleObj.content, `500 ${fontSize} OpenSans`);

  if(realText.width > titleObj.width) {
    let symbolsRemoveCount = Math.abs(Math.ceil((realText.width - titleObj.width) / maxWidthSymbol));
    let centerPos = Math.ceil((titleObj.content.length / 2) - (symbolsRemoveCount / 2));
    let startPart = titleObj.content.slice(0, centerPos - 7);
    let endPart = titleObj.content.slice(centerPos + symbolsRemoveCount + 7, titleObj.content.length);

    title.textContent = startPart + "..." + endPart;
    // titleObj.content = title.textContent;
    // console.log(
    //   "\tContent:" + titleObj.content,
    //   "\n\tContent Length: " + realText.length,
    //   "\n\tContent Width: " + realText.width,
    //   "\n\tSymbols Remove: " + symbolsRemoveCount,
    //   "\n\tReal Length: " + title.textContent.length,
    //   "\n\tReal Width: " + titleObj.width,
    //   "\n\tStart Part: " + startPart,
    //   "\n\tEnd Part: " + endPart,
    // )
  } else {
    title.textContent = titleObj.content;
  }
};

const setSizeGridTitle = (value) => {
  if(value != galleryGridSizer.min) {
    let size = value / galleryGridSizer.max;
    galleryGrid
      .querySelectorAll("h2")
      .forEach(title => {
        if(size < 0.63) size = 0.75;
        title.style.fontSize = `${size}em`;
        title.style.display = "inline";
        truncateTitle(title, size);
      });
  } else {
    galleryGrid
      .querySelectorAll("h2")
      .forEach(title => title.style.display = "none");
  }
};

galleryGridSizer.addEventListener("input", (e) => {
  setSizeGridCard(e.target.value);
  setSizeGridTitle(e.target.value);
});

document.querySelector("#gallery-grid-sizer-min").addEventListener("click", () => {
  setSizeGridCard(10);
  setSizeGridTitle(10);
  document.querySelector("#gallery-grid-sizer").value = galleryGridSizer.min;
});

document.querySelector("#gallery-grid-sizer-max").addEventListener("click", () => {
  setSizeGridCard(64);
  setSizeGridTitle(64);
  document.querySelector("#gallery-grid-sizer").value = galleryGridSizer.max;
});

// Navigation block actions

const navDirectory = document.querySelector(".nav-directory");

navDirectory.addEventListener("click", handlerDirectory);

function handlerDirectory(e) {
  if(e.target.tagName !== "SPAN") return;
  let path = new TreePath(rootFolderNode, viewFolder.getSelectedNodes()[viewFolder.getSelectedNodes().length - 1]);
  let indexOf = Array.from(navDirectory.querySelectorAll("span")).findIndex(element => e.target === element);
  let currNode = path.getPath()[indexOf];

  path.setPath(rootFolderNode, currNode);
  setAddress(path.getPath());  
  insertFolderHTML(currNode);
  
  viewFolder.getSelectedNodes().forEach(node => node.setSelected(false));
  currNode.setSelected(true);
  TreeUtil.collapseNode(currNode);
  viewFolder.reload();
}

document.querySelector(".nav-navigation").addEventListener("click", function(e) {
  let path = new TreePath(rootFolderNode, viewFolder.getSelectedNodes()[viewFolder.getSelectedNodes().length - 1]);
  let parentNode = path.getPath()[path.getPath().length - 2];
  let currNode = path.getPath()[path.getPath().length - 1];
  
  let currentLink = e.target.closest("a");  
  if(!e.isTrusted) currentLink = document.querySelector("#nav-prev");
  switch(currentLink.id.split("-")[1]) {
    case "refresh":
      if(currNode.equals(rootFolderNode)) return;
      handlerDirectory({target: navDirectory.querySelector("span:first-child")});
      break;
    case "prev":
      if(!parentNode) {
        return;
      }
      
      path.setPath(rootFolderNode, parentNode);
      setAddress(path.getPath());

      currNode.setSelected(false);
      parentNode.setSelected(true);

      if(!parentNode.isLeaf()) {
        TreeUtil.collapseNode(parentNode);
      }

      if(rootFolderNode.equals(parentNode)) {
        insertFolderHTML(rootFolderNode);
      }

      viewFolder.reload();
      break;
    case "next":
      if(currNode.isLeaf() || currNode.getChildren()[0].isLeaf()) return;

      path.setPath(rootFolderNode, currNode.getChildren()[0]);
      setAddress(path.getPath());

      currNode.setSelected(false);
      currNode.setExpanded(true);
      currNode.getChildren()[0].setSelected(true);

      viewFolder.reload();
      break;
  }
});

// Folder block actions

const setAddress = (params) => {
  navDirectory.innerHTML = "";
  params.forEach(node => {
    navDirectory.innerHTML += `<span>${node.getUserObject()}</span>/`;
  });
};

// Resizer

let folder = document.querySelector(".folder");
let gallery = document.querySelector(".gallery");
let resizer = document.querySelectorAll("#resize").forEach(resizer => {
  resizer.addEventListener("mousedown", function() {
    document.body.style.cursor = "e-resize";
    unlock = true;
  });
});
let gallerySlider = gallery.querySelector(".gallery-actions-slider");
let navSearch = document.querySelector(".nav-panel:last-child");
let navFirst = document.querySelector(".nav-panel:first-child");
let unlock = false;

document.addEventListener("mousemove", (e) => {
  let change = 100 - (e.clientX / window.innerWidth * 100);

  if(unlock && change > 1) {
    folder.style.width = `${change}%`;
    navSearch.style.width = `${change}%`;
    gallery.style.width = `${100 - change}%`;
    navFirst.style.width = `${100 - change}%`;
  }
});

document.addEventListener("mousedown", (e) => {
  if(unlock) {
    e.preventDefault();
  }
});

document.addEventListener("mouseup", function() {
  document.body.style.cursor = "default";
  unlock = false;
});

const allNodesInArr = (rootNode, array = []) => {
  rootNode.getChildren().forEach(node => {
    if(!node.isLeaf()) {
      allNodesInArr(node, array);
    }
    node.uniqueId = new TreePath(rootFolderNode, node).getPath().toString().split(",").join("/");
    array.push(node);
  });
  return array;
};

const selectorFolderNode = (node) => {
  let path = new TreePath(rootFolderNode, node);
  setAddress(path.getPath());

  insertFolderHTML(node);
};

const HTMLTemplateElements = {
  file: (item) => `
    <div
      class="gallery-grid-item"
      data-unique="${item.uniqueId}"
      onclick="app.evalHostScriptFile('${item.getOptions().eventAction}.jsx')"
      onmouseenter="this.querySelector('video').play()"
      onmouseleave="this.querySelector('video').load()"
    >
      <video xmlns="http://www.w3.org/1999/xhtml" loop width="100%" height="100%" muted="muted">
        <source src="mov/${item.getOptions().pathVideo ? item.getOptions().pathVideo : 'test.mp4'}" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'/>
      </video>
      <h2 class="gallery-grid-item__title" data-title="${item.getUserObject()}" style="margin: 5px 0px;">
        <div class="truncateDiv"></div>
      </h2>
    </div>
  `,
  folder: (item) => `
    <div class="gallery-grid-item" data-unique="${item.uniqueId}" style="padding: 12.5px 0px 6px"
      onmouseenter="this.querySelector('video').play()"
      onmouseleave="this.querySelector('video').load()"
    >
      <svg viewBox="0 0 136 99" fill="none" xmlns="http://www.w3.org/2000/svg" width="85%" height="85%">
        <g id="folder-header">
          <path d="M0 3.98473C0 1.78402 1.78403 0 3.98473 0H47.1347C49.3354 0 51.1194 1.78403 51.1194 3.98473V25H0V3.98473Z" fill="#444444"/>
          <path d="M51 15H132.015C134.216 15 136 16.784 136 18.9847V25H51V15Z" fill="#444444"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M51.1211 15H55.1058C52.9051 15 51.1211 13.216 51.1211 11.0152V15Z" fill="#444444"/>
        </g>
        <defs>
          <rect id="rect" y="22.5" width="100%" height="75%" ry="4"/>
          <clipPath id="clip">
            <use xlink:href="#rect"/>
          </clipPath>
        </defs>
        <use xlink:href="#rect"/>
        <foreignObject y="-2.5" width="100%" height="100%" clip-path="url(#clip)">
          <video
            xmlns="http://www.w3.org/1999/xhtml"
            loop
            width="100%"
            height="130px"
            muted="muted"
          >
            <source
              src="mov/test.mp4"
              type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
            />
          </video>
        </foreignObject>
      </svg>      
      <h2 class="gallery-grid-item__title" data-title="${item.getUserObject()}">
        <div class="truncateDiv"></div>
      </h2>
    </div>
  `,
  exitFolderItem: `
    <div class="exit-folder" onclick="document.querySelector('.nav-navigation').dispatchEvent(new Event('click'))">
      <svg width="40" height="100%" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7605 0.390371C20.3654 -0.0306821 19.6969 -0.0306825 19.3019 0.39037L0.555722 20.3715C-0.0433832 21.0101 0.40939 22.0557 1.28501 22.0557H10.6805V40.7579H29.3827V22.0557H38.7774C39.653 22.0557 40.1058 21.0101 39.5067 20.3715L20.7605 0.390371Z" fill="#838080"/>
      </svg>
      <h2 class="gallery-grid-item__title" data-title="Exit folder" style="margin: 5px 0px;">
        <div class="truncateDiv"></div>
      </h2>
    </div>
  `
};

const insertFolderHTML = (parentNode) => {
  let parentHasOnlyLeaf = parentNode.getChildren().filter(child => !child.isLeaf()).length;

  galleryGrid.innerHTML = "";
  if(!parentNode.equals(rootFolderNode)) {
    galleryGrid.innerHTML = HTMLTemplateElements.exitFolderItem;
  }

  if(!parentHasOnlyLeaf) {
    parentNode.getChildren().forEach(item => {
        galleryGrid.innerHTML += HTMLTemplateElements.file(item);
        console.log(item.getOptions(), item.getUserObject());
    });
  } else {
    parentNode.getChildren().forEach(item => {
      if(item.isLeaf()) return;
      galleryGrid.innerHTML += HTMLTemplateElements.folder(item);
    });
  }

  galleryGrid.querySelectorAll(".gallery-grid-item").forEach((item) => {
    let currNode = treeInArr.find(node => node.uniqueId === item.dataset.unique);

    if(currNode.isLeaf()) return;
    item.addEventListener("click", function() {
      if(parentHasOnlyLeaf) {
        viewFolder.getSelectedNodes()[0].setSelected(false);
        parentNode.setExpanded(true);
      }
      currNode.setSelected(true);

      viewFolder.reload();
    });
  });

  setSizeGridCard(galleryGridSizer.value);
  setSizeGridTitle(galleryGridSizer.value);
};

const createTreeBranch = (rootNode, arrNodes) => {
  arrNodes.forEach(dataNode => {
    let node = new TreeNode(dataNode.data);
    node.setOptions(dataNode.options);

    rootNode.addChild(node);
  });
  return rootNode;
};

let fileTree = {
  data: "Transitions.fun",
  children: [
    {
      data: "Favorites",
      children: [
        {
          data: "File",
          options: {eventAction: "01 - Broken Glass - down"}
        }
      ],
      options: {
        icon: `<svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.51114 3.99932H0V12.9993H14V7.98721L11.6496 6.27956L7.6021 9.22027L9.14812 4.46211L8.51114 3.99932ZM15.121 2.52141L12.4695 2.52141L12.4691 2.52141L11.6498 0L10.8306 2.52141H8.17871L10.2129 3.99932H10.2124L10.3237 4.08014L9.50421 6.60223L11.6496 5.0435L13.795 6.60223L12.9756 4.08014L15.121 2.52141ZM4 1.99932H0V2.99932H5C5 2.44704 4.55228 1.99932 4 1.99932Z" fill="#BDBDBD"/>
        </svg>`,
      }
    },
    {
      data: "01. Zoom",
      children: [
        {
          data: "Anchor Zoom",
          children: [
            {
              data: "Elastic zoom",
              children: [
                {
                  data: "01 Zoom Elastic in - hard.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom/01 Zoom Elastic in - hard.mp4"}
                },
                {
                  data: "02 Zoom Elastic in - hard - fast.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom/02 Zoom Elastic in - hard - fast.mp4"}
                },
                {
                  data: "03 Zoom Elastic in - light.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom/03 Zoom Elastic in - light.mp4"}
                },
                {
                  data: "04 Zoom Elastic in - light - fast.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom/04 Zoom Elastic in - light - fast.mp4"}
                },
                {
                  data: "05 Zoom Elastic out - light.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom/05 Zoom Elastic out - light.mp4"}
                },
                {
                  data: "06 Zoom Elastic out - light - fast.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom/06 Zoom Elastic out - light - fast.mp4"}
                },
                {
                  data: "07 Zoom Elastic out - hard.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom/07 Zoom Elastic out - hard.mp4"}
                },
                {
                  data: "08 Zoom Elastic out - hard - fast.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom/08 Zoom Elastic out - hard - fast.mp4"}
                },
              ]
            },
            {
              data: "Elastic zoom - RGB-split",
              children: [
                {
                  data: "01 Zoom Elastic RGB in - hard.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom - RGB-split/01 Zoom Elastic RGB in - hard.mp4"}
                },
                {
                  data: "02 Zoom Elastic RGB in - hard - fast.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom - RGB-split/02 Zoom Elastic RGB in - hard - fast.mp4"}
                },
                {
                  data: "03 Zoom Elastic RGB in - light.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom - RGB-split/03 Zoom Elastic RGB in - light.mp4"}
                },
                {
                  data: "04 Zoom Elastic RGB in - light - fast.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom - RGB-split/04 Zoom Elastic RGB in - light - fast.mp4"}
                },
                {
                  data: "05 Zoom Elastic RGB out - light.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom - RGB-split/05 Zoom Elastic RGB out - light.mp4"}
                },
                {
                  data: "06 Zoom Elastic RGB out - light - fast.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom - RGB-split/06 Zoom Elastic RGB out - light - fast.mp4"}
                },
                {
                  data: "07 Zoom Elastic RGB out - hard.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom - RGB-split/07 Zoom Elastic RGB out - hard.mp4"}
                },
                {
                  data: "08 Zoom Elastic RGB out - hard - fast.mp4",
                  options: {pathVideo: "01. Zoom/Anchor Zoom/Elastic zoom - RGB-split/08 Zoom Elastic RGB out - hard - fast.mp4"}
                },
              ]
            },
            {data: "Pixelation zoom - v.1"},
            {data: "Pixelation zoom - v.2"},
            {data: "Simple zoom"},
            {data: "Simple zoom - RGB-split"},
          ]
        },
        {data: "Elastic zoom"},
        {data: "Elastic zoom - RGB-split"},
        {data: "Lens zoom"},
        {data: "Lens zoom - RGB-split"},
        {data: "Optics zoom - v.1"},
        {data: "Optics zoom - v.2"},      
        {data: "Pixelation zoom - v.1"},
        {data: "Pixelation zoom - v.2"},
        {data: "Short zoom"},
        {data: "Simple zoom"},
        {data: "Simple zoom - RGB-split"},
      ]
    },
    {
      data: "02. Glitch",
      children: [
        {data: "Glitch - Aberrations"},
        {data: "Glitch - Bad Signal"},
        {data: "Glitch - Bad Signal - RGB-split"},
        {data: "Glitch - Invert"},
        {data: "Glitch - Magnify"},
        {data: "Glitch - Magnify - RGB-split"},
        {data: "Glitch - Offset v.1"},
        {data: "Glitch - Offset v.2"},
        {data: "Glitch - Strobe"},
        {data: "Glitch - TV noise"},
      ]
    },
    {
      data: "03. Flat",
      children: [
        {data: "Flat"},
        {data: "Flat - Blur"},
        {data: "Flat - Bounce"},
        {data: "Flat - Bounce - RGB-split"},
        {data: "Flat - Elastic"},
        {data: "Flat - Elastic - RGB-split"},
        {data: "Flat - Hit"},
        {data: "Flat - Light Leaks"},
        {data: "Flat - RGB-split"},
        {data: "Flat - Short"},
      ]
    },
    {data: "04. Camera"},
    {
      data: "05. Warp",
      children: [
        {data: "Warp"},
        {data: "Warp - Light Leaks"},
        {data: "Warp - RGB-split"},
      ]
    },
    {
      data: "06. Spin",
      children: [
        {data: "Spin Center"},
        {data: "Spin Center - Elastic"},
        {data: "Spin Center - Elastic - RGB-split"},
        {data: "Spin Center - Lens"},
        {data: "Spin Center - Lens - RGB-split"},
        {data: "Spin Corner"},
        {data: "Spin Corner - Bounce"},
        {data: "Spin Corner - Bounce - RGB-split"},
        {data: "Spin Corner - Elastic"},
        {data: "Spin Corner - Elastic - RGB-split"},
        {data: "Spin Corner - Fast"},
        {data: "Spin Corner - Fast - RGB-split"},
      ]
    },
    {
      data: "07. Perspective",
      children: [
        {data: "Perspective - In"},
        {data: "Perspective - In Fast"},
        {data: "Perspective - Out"},
        {data: "Perspective - Out Fast"},
        {data: "Perspective Elastic - In"},
        {data: "Perspective Elastic - Out"},
        {data: "Perspective Hit - In"},
        {data: "Perspective Hit - Out"},
      ]
    },
    {
      data: "08. Stretch",
      children: [
        {data: "Stretch"},
        {data: "Stretch - RGB-split"}
      ]
    },
    {
      data: "09. Panoramic",
      children: [
        {data: "Panoramic"},
        {data: "Panoramic - Light Leaks"},
        {data: "Panoramic - RGB-split"},
      ]
    },
    {data: "10. Shake"},
    {
      data: "11. Light Leaks",
      children: [
        {data: "V1"},
        {data: "V2"},
      ]
    },
    {
      data: "12. Fade",
      children: [
        {data: "Exposure"},
        {data: "Fade blur"},
      ]
    },
    {
      data: "13. Split",
      children: [
        {data: "Split - 2 Lines"},
        {data: "Split - 3 Lines"}
      ]
    },
    {
      data: "14. Text Transitions",
      children: [
        {
          data: "Flat",
          children: [
            {data: "Flat"},
            {data: "Flat - Bounce"},
            {data: "Flat - Elastic"},
            {data: "Flat - Short"}
          ]
        },
        {
          data: "Glitch",
          children: [
            {data: "Glitch - Aberrations"},
            {data: "Glitch - Bad Signal"},
            {data: "Glitch - Offset"},
            {data: "Glitch - Strobe"}
          ]
        },
        {
          data: "Spin",
          children: [
            {data: "Spin Center"},
            {data: "Spin Center - Elastic"},
            {data: "Spin Center - Lens"}
          ]
        },
        {data: "Warp"},
        {
          data: "Zoom",
          children: [
            {data: "Elastic zoom"},
            {data: "Optics zoom"}
          ]
        }
      ]
    },
    {
      data: "15. Stripes",
      children: [
        {data: "Stripes - Diagonal 01"},
        {data: "Stripes - Diagonal 02"},
        {data: "Stripes - Horizontal"},
        {data: "Stripes - Vertical"},
      ]
    },
    {
      data: "16. Glass",
      children: [
        {data: "Broken glass"},
        {data: "Broken glass RGB"},
        {data: "Sliding Glass Diagonal 1"},
        {data: "Sliding Glass Diagonal 2"},
        {data: "Sliding Glass Horizontal"},
        {data: "Sliding Glass Vertical"},
      ]
    },
    {
      data: "Color Presets",
      children: [
        {
          data: "Cinematic Pack 1",
          children: [
            {data: "Black & White"},
            {data: "Cold"},
            {data: "Evening"},
            {data: "Warm"},
            {data: "Weather"},
          ]
        },
        {
          data: "Cinematic Pack 2",
          children: [
            {data: "Black & White"},
            {data: "Cold 2"},
            {data: "Old Film"},
            {data: "Warm 2"},
          ]
        },
        {
          data: "Wedding Pack",
          children: [
            {data: "Black & White"},
            {data: "Cold"},
            {data: "Warm"},
          ]
        }
      ]
    },
    {
      data: "Footage",
      children: [
        {
          data: "Audio",
          children: [
            {data: "30 Glitch Sound Effects Pack"},
            {data: "Bells"},
            {data: "Buttons"},
            {data: "Camera"},
            {data: "Cinematic Epic Trailer Hit and Impact Sounds - Pack 1"},
            {data: "Cinematic Sub Drop"},
            {data: "Cinematic Whoosh Swoosh Sounds - pack 1"},
            {data: "Cinematic Whoosh Swoosh Sounds - pack 2"},
            {data: "Cinematic Whoosh Swoosh Sounds - pack 3"},
            {data: "Cinematic Whoosh Swoosh Sounds - pack 4"},
            {data: "Cinematic Whoosh Swoosh Sounds - pack 5"},
            {data: "Clicks"},
            {data: "Digital HUD Interface Sounds"},
            {data: "Dramatic Horn Transitions"},
            {data: "Epic Cinematic Trailer Impact - Pack 2"},
            {data: "Glass"},
            {data: "Glitch TV noise"},
            {data: "Glitch transition sounds"},
            {data: "Subdrop Low"},
            {data: "Subdrop Low+Hi"},
            {data: "Whoosh Swoosh Sounds - pack 1"},
            {data: "Whoosh Swoosh Sounds - pack 2"},
            {data: "Whoosh Swoosh Sounds - pack 3"},
            {data: "Whoosh Swoosh Sounds - pack 4"},
            {data: "Whoosh Swoosh Sounds - pack 5"},
          ]
        }
      ]
    },
    {
      data: "Motion Presets",
      children: [
        {data: "Distortion"},
        {data: "Distortion - RGB-split"},
      ]
    },
  ]
};

const recursiveTraversal = (obj) => {
  let rootNode = new TreeNode(obj.data);
  rootNode.setOptions(obj.options);
  
  obj.children.forEach(element => {
    if(element.children && element.children.length) {
      rootNode.addChild(recursiveTraversal(element));
    }
  });
  return createTreeBranch(rootNode, obj.children);
};

let rootFolderNode = recursiveTraversal(fileTree);

let viewFolder = new TreeView(rootFolderNode, document.getElementById("folder-root"), {
  show_root: false,
  leaf_icon: `<svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M4 0H0V1H5C5 0.447715 4.55228 0 4 0ZM14 2H0V11H14V2Z" fill="#BDBDBD"/>
  </svg>`,
  parent_icon: `<svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M4 0H0V1H5C5 0.447715 4.55228 0 4 0ZM14 2H0V11H14V2Z" fill="#BDBDBD"/>
  </svg>`
});

const treeInArr = allNodesInArr(rootFolderNode);
treeInArr.forEach(node => node.on("select", selectorFolderNode));

selectorFolderNode(rootFolderNode);

rootFolderNode.setSelected(true);

navSearch.querySelector("#nav-search").addEventListener("input", function() {
  galleryGrid.innerHTML = "<img style='20%' src='./img/preload.gif' alt='loader icon'/>";
  galleryGrid.style.placeItems = "center";
  galleryGrid.style.gridTemplateColumns = "1fr";
  galleryGrid.style.gridTemplateRows = "1fr";
  galleryGrid.style.height = "100%";

  setTimeout(() => {
    galleryGrid.style.gridTemplateRows = "auto";
    galleryGrid.style.placeItems = "unset";
    galleryGrid.innerHTML = "";

    treeInArr.forEach(node => {
      if(node.getUserObject().toLowerCase().includes(this.value.toLowerCase()) && node.isLeaf()) {
        galleryGrid.innerHTML += HTMLTemplateElements.file(node);
      }
    });

    setSizeGridCard(galleryGridSizer.value);
    setSizeGridTitle(galleryGridSizer.value);
  }, 1500);
});

navSearch.querySelector("#nav-search").addEventListener("blur", function() {this.value = "";});

navSearch.querySelector("#nav-search").addEventListener("keyup", function(e) {if(e.code === "Escape") this.value = "";});