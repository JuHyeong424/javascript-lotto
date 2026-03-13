(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const PRIZE = {
  FIRST: 2e9,
  SECOND: 3e7,
  THIRD: 15e5,
  FOURTH: 5e4,
  FIFTH: 5e3
};
const MONEY_UNIT = 1e3;
const LOTTO_RANGE = {
  MAX: 45,
  MIN: 1,
  COUNT: 6
};
const RESTART = "RESTART";
const ERROR_MESSAGE = {
  PURCHASE_MONEY: {
    NONE: "[ERROR] 구입 금액을 입력해주세요.",
    MIN: "[ERROR] 구입 금액은 1000원 이상입니다.",
    NUMBER: "[ERROR] 구입 금액은 숫자만 입력해야 합니다.",
    UNIT: "[ERROR] 구입 금액은 1000원 단위입니다."
  },
  WINNING_NUMBER: {
    LENGTH: "[ERROR] 당첨 번호는 6개이어야 합니다.",
    COMMA: "[ERROR] 콤마(,) 사이에 숫자를 입력해야 합니다.",
    RANGE: "[ERROR] 당첨 번호는 1 ~ 45 사이어야 합니다.",
    REGEX: "[ERROR] 당첨 번호 구분은 콤마(,) 입니다.",
    DUPLICATE: "[ERROR] 당첨 번호가 중복입니다."
  },
  BONUS_NUMBER: {
    RANGE: "[ERROR] 보너스 번호는 1 ~ 45 사이어야 합니다.",
    NUMBER: "[ERROR] 숫자를 입력해야 합니다.",
    DUPLICATE: "[ERROR] 당첨 번호랑 중복입니다."
  },
  RETRY: {
    INVALID: "[ERROR] 다시 입력해주세요."
  }
};
const RETRY_ANSWER = {
  YES: ["y", "Y"],
  NO: ["n", "N"]
};
function checkNumberRange(winningNumberArray) {
  const booleanArray = winningNumberArray.map((element) => {
    return getBooleanNumberRange(element);
  });
  return booleanArray;
}
function getBooleanNumberRange(element) {
  if (element < LOTTO_RANGE.MIN || element > LOTTO_RANGE.MAX) return false;
  return true;
}
const Validator = {
  validatePurchaseMoney(money) {
    if (!money) {
      throw new Error(ERROR_MESSAGE.PURCHASE_MONEY.NONE);
    }
    if (isNaN(money)) {
      throw new Error(ERROR_MESSAGE.PURCHASE_MONEY.NUMBER);
    }
    if (money < MONEY_UNIT) {
      throw new Error(ERROR_MESSAGE.PURCHASE_MONEY.MIN);
    }
    if (money % MONEY_UNIT !== 0) {
      throw new Error(ERROR_MESSAGE.PURCHASE_MONEY.UNIT);
    }
  },
  validateWinningNumber(winningNumber) {
    if (winningNumber === RESTART) return;
    const winningNumberArray = winningNumber.split(",");
    const regex = /^[0-9,]+$/;
    if (winningNumberArray.length !== 6) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.LENGTH);
    }
    if (winningNumber.includes(",,")) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.COMMA);
    }
    if (checkNumberRange(winningNumberArray).includes(false)) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.RANGE);
    }
    if (!regex.test(winningNumber)) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.REGEX);
    }
    const set = new Set(winningNumberArray);
    if (set.size < LOTTO_RANGE.COUNT) {
      throw new Error(ERROR_MESSAGE.WINNING_NUMBER.DUPLICATE);
    }
  },
  validateBonusNumber(winningNumber, bonusNumber) {
    const winningNumberArray = winningNumber.split(",").map(Number);
    if (bonusNumber < LOTTO_RANGE.MIN || bonusNumber > LOTTO_RANGE.MAX) {
      throw new Error(ERROR_MESSAGE.BONUS_NUMBER.RANGE);
    }
    if (isNaN(bonusNumber)) {
      throw new Error(ERROR_MESSAGE.BONUS_NUMBER.NUMBER);
    }
    if (winningNumberArray.includes(bonusNumber)) {
      throw new Error(ERROR_MESSAGE.BONUS_NUMBER.DUPLICATE);
    }
  },
  validateRetry(retry) {
    if (!RETRY_ANSWER.YES.includes(retry) && !RETRY_ANSWER.NO.includes(retry)) {
      throw new Error(ERROR_MESSAGE.RETRY.INVALID);
    }
  }
};
const webOutputPrinter = {
  printMyLottoLists(randomLottos) {
    const myLotto = document.getElementById("myLotto");
    const myLottoP = document.getElementById("myLottoP");
    const myLottoLists = document.getElementById("myLottoLists");
    myLottoLists.innerHTML = "";
    myLottoP.innerHTML = `총 ${randomLottos.length}개를 구매하였습니다.`;
    for (const lotto of randomLottos) {
      const newLi = document.createElement("li");
      newLi.className = "myLottoListLi";
      newLi.textContent = `🎟️ ${lotto.getNumber().join(", ")}`;
      myLottoLists.appendChild(newLi);
    }
    const winningDiv = document.getElementById("winningDiv");
    winningDiv.style.display = "block";
    const getResultButton = document.getElementById("getResultButton");
    getResultButton.style.display = "block";
    myLotto.style.display = "block";
  },
  printLottoResult(result) {
    const arrayKey = ["FIFTH", "FOURTH", "THIRD", "SECOND", "FIRST"];
    const prizeMoney = document.querySelectorAll(".prizeMoney");
    const winningCount = document.querySelectorAll(".winningCount");
    for (let i = 0; i < prizeMoney.length; i++) {
      prizeMoney[i].innerText = `${PRIZE[arrayKey[i]].toLocaleString()}`;
      winningCount[i].innerText = `${result[arrayKey[i]]}개`;
    }
    const resultModal = document.getElementById("resultModal");
    resultModal.style.display = "flex";
  },
  printProfit(profit) {
    const profitP = document.getElementById("profitP");
    profitP.innerText = `당신의 총 수익률은 ${profit.toFixed(1)}%입니다.`;
  }
};
const OutputView = {
  isWeb: false,
  setIsWeb(boolean) {
    this.isWeb = boolean;
  },
  outputLottoNumber(randomLottos) {
    if (this.isWeb) webOutputPrinter.printMyLottoLists(randomLottos);
    console.log(randomLottos.length, "개를 구매했습니다.");
    for (let i = 0; i < randomLottos.length; i++) {
      console.log(randomLottos[i].getNumber());
    }
  },
  outputWinningStatics(result) {
    if (this.isWeb) webOutputPrinter.printLottoResult(result);
    const output = [
      "\n당첨 통계",
      "---------------",
      `3개 일치 (${PRIZE.FIFTH.toLocaleString()}원) - ${result.FIFTH}개`,
      `4개 일치 (${PRIZE.FOURTH.toLocaleString()}원) - ${result.FOURTH}개`,
      `5개 일치 (${PRIZE.THIRD.toLocaleString()}원) - ${result.THIRD}개`,
      `5개 일치, 보너스 볼 일치 (${PRIZE.SECOND.toLocaleString()}원) - ${result.SECOND}개`,
      `6개 일치 (${PRIZE.FIRST.toLocaleString()}원) - ${result.FIRST}개`
    ].join("\n");
    console.log(output);
  },
  outputWinningProfit(profit) {
    if (this.isWeb) webOutputPrinter.printProfit(profit);
    console.log(`총 수익률은 ${profit.toFixed(1)}%입니다.`);
  },
  outputError(message) {
    if (this.isWeb) alert(message);
    console.log(message);
  }
};
const InputView = {
  readerObject: null,
  setReader(reader) {
    this.readerObject = reader;
  },
  async inputPurchaseAmount() {
    try {
      const money = await this.readerObject.readPurchaseMoney();
      Validator.validatePurchaseMoney(money);
      return Number(money);
    } catch (error) {
      OutputView.outputError(error.message);
      return this.inputPurchaseAmount();
    }
  },
  async inputWinningNumber() {
    try {
      const winningNumber = await this.readerObject.readWinningNumber();
      Validator.validateWinningNumber(winningNumber);
      return winningNumber;
    } catch (error) {
      OutputView.outputError(error.message);
      return this.inputWinningNumber();
    }
  },
  async inputBonusNumber(winningNumber) {
    try {
      const bonusNumber = await this.readerObject.readBonusNumber();
      Validator.validateBonusNumber(winningNumber, Number(bonusNumber));
      return Number(bonusNumber);
    } catch (error) {
      OutputView.outputError(error.message);
      return this.inputBonusNumber(winningNumber);
    }
  },
  async inputRetry() {
    try {
      const retry = await this.readerObject.readRetry();
      Validator.validateRetry(retry);
      return retry;
    } catch (error) {
      OutputView.outputError(error.message);
      return this.inputRetry();
    }
  }
};
function calculateLottoCount(money) {
  return money / MONEY_UNIT;
}
class Lotto {
  #number = [];
  constructor(number) {
    this.#number = number;
  }
  static generateRandomLotto() {
    const lottoSet = /* @__PURE__ */ new Set();
    while (lottoSet.size < LOTTO_RANGE.COUNT) {
      lottoSet.add(Math.floor(Math.random() * LOTTO_RANGE.MAX + LOTTO_RANGE.MIN));
    }
    const lottoArray = Array.from(lottoSet);
    lottoArray.sort((a, b) => a - b);
    return lottoArray;
  }
  getNumber() {
    return [...this.#number];
  }
}
function getLottos(count) {
  const randomLottos = [];
  for (let i = 0; i < count; i++) {
    const lotto = Lotto.generateRandomLotto();
    randomLottos.push(new Lotto(lotto));
  }
  return randomLottos;
}
class MyLotto {
  #money;
  #randomLotto = [];
  constructor(money, randomLotto) {
    this.#money = money;
    this.#randomLotto = randomLotto;
  }
  resetRandomLotto() {
    this.#randomLotto = [];
  }
  static createMyLotto(money) {
    const count = calculateLottoCount(money);
    const randomLottos = getLottos(count);
    return new MyLotto(money, randomLottos);
  }
  getProfit(result) {
    const totalPrize = result.FIRST * PRIZE.FIRST + result.SECOND * PRIZE.SECOND + result.THIRD * PRIZE.THIRD + result.FOURTH * PRIZE.FOURTH + result.FIFTH * PRIZE.FIFTH;
    const profit = totalPrize / this.#money * 100;
    return profit;
  }
  getMoney() {
    return this.#money;
  }
  getRandomLotto() {
    return [...this.#randomLotto];
  }
}
async function PurchaseLottoController() {
  const money = await InputView.inputPurchaseAmount();
  const myLotto = MyLotto.createMyLotto(money);
  OutputView.outputLottoNumber(myLotto.getRandomLotto());
  return myLotto;
}
class WinningLotto {
  #winningNumber;
  #bonusNumber;
  constructor(winningNumber, bonusNumber) {
    this.#winningNumber = this.#splitWinnigNumber(winningNumber);
    this.#bonusNumber = bonusNumber;
  }
  getRank(userLotto) {
    const matchCount = userLotto.getNumber().filter((item) => this.#winningNumber.includes(item)).length;
    if (matchCount === 6) return "FIRST";
    if (matchCount === 5 && this.hasBonusNumber(userLotto)) return "SECOND";
    if (matchCount === 5) return "THIRD";
    if (matchCount === 4) return "FOURTH";
    if (matchCount === 3) return "FIFTH";
  }
  hasBonusNumber(userLotto) {
    return userLotto.getNumber().includes(Number(this.#bonusNumber));
  }
  getWinningNumber() {
    return this.#winningNumber;
  }
  getBonusNumber() {
    return this.#bonusNumber;
  }
  #splitWinnigNumber(winningNumber) {
    return winningNumber.split(",").map(Number);
  }
}
async function WinningLottoController() {
  const winningNumber = await InputView.inputWinningNumber();
  if (winningNumber === RESTART) return RESTART;
  const bonusNumber = await InputView.inputBonusNumber(winningNumber);
  const winningLotto = new WinningLotto(winningNumber, bonusNumber);
  return winningLotto;
}
function getCompareResult(userLottos, winningLotto) {
  const rankResult = {
    FIRST: 0,
    SECOND: 0,
    THIRD: 0,
    FOURTH: 0,
    FIFTH: 0
  };
  userLottos.forEach((userLotto) => {
    const rank = winningLotto.getRank(userLotto);
    if (rank) rankResult[rank]++;
  });
  return rankResult;
}
function ResultController(myLotto, winningLotto) {
  const rankResult = getCompareResult(myLotto.getRandomLotto(), winningLotto);
  const profit = myLotto.getProfit(rankResult);
  OutputView.outputWinningStatics(rankResult);
  OutputView.outputWinningProfit(profit);
}
class LottoController {
  async play() {
    const myLotto = await PurchaseLottoController();
    const winningLotto = await WinningLottoController();
    if (winningLotto === RESTART) {
      myLotto.resetRandomLotto();
      return this.play();
    }
    ResultController(myLotto, winningLotto);
    const retry = await InputView.inputRetry();
    if (RETRY_ANSWER.YES.includes(retry)) return this.play();
  }
}
const webInputReader = {
  isRestarting: false,
  readPurchaseMoney() {
    return new Promise((resolve) => {
      const purchaseInput = document.getElementById("purchaseInput");
      const purchaseButton = document.getElementById("purchaseButton");
      if (this.isRestarting) {
        this.isRestarting = false;
        return resolve(purchaseInput.value);
      }
      const onClick = () => {
        resolve(purchaseInput.value);
      };
      purchaseButton.addEventListener("click", onClick);
    });
  },
  savedBonusNumber: null,
  checkedBonusNumber: false,
  readWinningNumber() {
    return new Promise((resolve) => {
      const getResultButton = document.getElementById("getResultButton");
      const winningInput = document.querySelectorAll("input.winningInput");
      const bonusInput = document.getElementById("bonusInput");
      const resultModal = document.getElementById("resultModal");
      const purchaseButton = document.getElementById("purchaseButton");
      purchaseButton.addEventListener("click", () => {
        this.isRestarting = true;
        resolve(RESTART);
      });
      const onClick = () => {
        resultModal.classList.add("active");
        this.savedBonusNumber = bonusInput.value;
        const winningNumberArray = Array.from(winningInput).map((item) => item.value).filter(Boolean);
        const winningNumberString = winningNumberArray.join(",");
        resolve(winningNumberString);
      };
      getResultButton.addEventListener("click", onClick);
    });
  },
  readBonusNumber() {
    return new Promise((resolve) => {
      if (this.checkedBonusNumber) {
        const getResultButton = document.getElementById("getResultButton");
        const bonusInput = document.getElementById("bonusInput");
        const onClick = () => {
          resolve(bonusInput.value);
          return;
        };
        getResultButton.addEventListener("click", onClick);
      } else {
        this.checkedBonusNumber = true;
        resolve(this.savedBonusNumber);
        this.savedBonusNumber = null;
      }
    });
  },
  readRetry() {
    return new Promise((resolve) => {
      const myLotto = document.getElementById("myLotto");
      const winningDiv = document.getElementById("winningDiv");
      const getResultButton = document.getElementById("getResultButton");
      const resultModal = document.getElementById("resultModal");
      const resultModalClose = document.getElementById("result-modal-close");
      const retryButton = document.getElementById("retryButton");
      const onClick = () => {
        this.isRestarting = false;
        this.checkedBonusNumber = false;
        resultModal.classList.remove("active");
        myLotto.style.display = "none";
        winningDiv.style.display = "none";
        getResultButton.style.display = "none";
        resultModal.style.display = "none";
        document.querySelectorAll("input[type=number]").forEach((item) => {
          item.value = "";
        });
        document.querySelectorAll(".myLottoListLi").forEach((element) => {
          element.remove();
        });
        resolve("y");
      };
      retryButton.addEventListener("click", onClick);
      resultModalClose.addEventListener("click", onClick);
    });
  }
};
InputView.setReader(webInputReader);
OutputView.setIsWeb(true);
const lottoGame = new LottoController();
await lottoGame.play();
