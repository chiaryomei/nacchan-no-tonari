(() => {
  "use strict";

  /* ========================================
     設定
     ======================================== */

  // フェードの片道の時間（ミリ秒）。暗転と明転でそれぞれこの時間がかかる
  const FADE_DURATION_MS = 300;

  // 画面名は index.html の data-screen と対応する
  const SCREEN = Object.freeze({
    TITLE: "title",
    GAME: "game",
  });

  // 画面ごとの処理。onEnter は表示直後、onLeave は非表示にする直前に呼ばれる
  const screenHandlers = {
    [SCREEN.TITLE]: {
      onEnter() {},
      onLeave() {},
    },
    [SCREEN.GAME]: {
      onEnter() {},
      onLeave() {},
    },
  };

  /* ========================================
     画面管理
     ======================================== */

  const appElement = document.getElementById("app");
  const fadeElement = document.getElementById("fade");

  const screenElements = new Map();
  appElement.querySelectorAll("[data-screen]").forEach((element) => {
    screenElements.set(element.dataset.screen, element);
  });

  let currentScreen = null;
  let isTransitioning = false;

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  // 演出なしで画面を表示する
  function showScreen(name) {
    if (currentScreen !== null) {
      screenHandlers[currentScreen]?.onLeave?.();
    }

    screenElements.forEach((element, elementName) => {
      element.hidden = elementName !== name;
    });

    currentScreen = name;
    screenElements.get(name).scrollTop = 0;
    screenHandlers[name]?.onEnter?.();
  }

  // フェードしながら画面を切り替える
  async function changeScreen(name) {
    if (!screenElements.has(name)) {
      console.error(`画面が見つかりません: ${name}`);
      return;
    }
    if (isTransitioning || name === currentScreen) {
      return;
    }

    isTransitioning = true;
    fadeElement.classList.add("is-blocking", "is-covered");

    try {
      await wait(FADE_DURATION_MS);

      showScreen(name);
      screenElements.get(name).focus({ preventScroll: true });

      fadeElement.classList.remove("is-covered");
      await wait(FADE_DURATION_MS);
    } finally {
      // 途中でエラーが起きても、幕が残って操作不能にならないようにする
      fadeElement.classList.remove("is-covered", "is-blocking");
      isTransitioning = false;
    }
  }

  /* ========================================
     操作
     ======================================== */

  // data-go-to を付けたボタンは、指定した画面へ移動する
  function handleClick(event) {
    const button = event.target.closest("[data-go-to]");
    if (button) {
      changeScreen(button.dataset.goTo);
    }
  }

  /* ========================================
     初期化
     ======================================== */

  function init() {
    document.documentElement.style.setProperty(
      "--fade-duration",
      `${FADE_DURATION_MS}ms`
    );
    appElement.addEventListener("click", handleClick);
    showScreen(SCREEN.TITLE);
  }

  init();
})();
