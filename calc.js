    const buttons = document.querySelectorAll("button");
    const screenDisplay = document.getElementById("value");
    const acButton = document.querySelector('.C');
    const backspaceButton = document.querySelector('.backspace');
    const num = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const maxChars = 15;

    let currentOperand = "";
    let previousOperand = "";
    let operation = undefined;
    let shouldResetScreen = false;
    let memory = 0;
    let lastOperationHistory = undefined;
    let lastOperandHistory = "";

    function clearHistory() {
      lastOperationHistory = undefined;
      lastOperandHistory = "";
    }

    function clearOperatorHighlights() {
      const operatorButtons = document.querySelectorAll('.operator');
      operatorButtons.forEach(btn => btn.classList.remove('operator-active'));
    }

    function clear() {
      currentOperand = "";
      previousOperand = "";
      operation = undefined;
      shouldResetScreen = false;
      clearHistory();
      clearOperatorHighlights();
      updateScreen("0");
    }

    function updateScreen(value) {
      if (value === undefined || value === null) return;

      let valueStr = value.toString();

      if (valueStr.toLowerCase() === "error") {
        screenDisplay.textContent = "Error";
        backspaceButton.classList.remove('backspace-active');
        return;
      }

      if (valueStr.length > maxChars) {
        const num = parseFloat(valueStr);
        if (!isNaN(num)) {
          let foundFit = false;
          for (let prec = 8; prec >= 0; prec--) {
            valueStr = num.toExponential(prec);
            if (valueStr.length <= maxChars) {
              foundFit = true;
              break;
            }
          }
          if (!foundFit) {
            valueStr = num.toExponential(0).substring(0, maxChars);
          }
        } else {
          valueStr = valueStr.substring(0, maxChars);
        }
      }

      screenDisplay.textContent = valueStr;

      if (valueStr !== "0") {
        backspaceButton.classList.add('backspace-active');
      } else {
        backspaceButton.classList.remove('backspace-active');
      }
    }

    function appendNumber(number) {
      if (screenDisplay.textContent === "Error") clear();
      if (number === "." && currentOperand.includes(".")) return;

      if (currentOperand.length >= maxChars && !shouldResetScreen) return;

      if (shouldResetScreen) {
        currentOperand = number;
        shouldResetScreen = false;
        clearHistory();
      } else {
        if (currentOperand === "" && number === ".") {
          currentOperand = "0.";
        } else if (currentOperand === "0" && number !== ".") {
          currentOperand = number;
        } else {
          currentOperand += number;
        }
      }

      updateScreen(currentOperand);
    }

    function chooseOperation(op, buttonElement) {
  if (screenDisplay.textContent === "Error") return;

  if (shouldResetScreen && currentOperand === previousOperand) {
    clearOperatorHighlights();
    buttonElement.classList.add('operator-active');
    operation = op;
    return;
  }

  if (previousOperand !== "") compute();
  if (currentOperand !== "") previousOperand = currentOperand;
  clearHistory();
  clearOperatorHighlights();
  buttonElement.classList.add('operator-active');
  operation = op;
  shouldResetScreen = true;
}


    function compute() {
      let result;
      const prev = parseFloat(previousOperand);
      const current = parseFloat(currentOperand);

      if ((isNaN(prev) || !operation) && lastOperationHistory) {
        const prevFromDisplay = parseFloat(currentOperand);
        const lastOp = parseFloat(lastOperandHistory);
        if (isNaN(prevFromDisplay) || isNaN(lastOp)) return;

        switch (lastOperationHistory) {
          case "+": result = prevFromDisplay + lastOp; break;
          case "-": result = prevFromDisplay - lastOp; break;
          case "x": result = prevFromDisplay * lastOp; break;
          case "÷":
            if (lastOp === 0) { updateScreen("Error"); clear(); return; }
            result = prevFromDisplay / lastOp; break;
          case "^": result = Math.pow(prevFromDisplay, lastOp); break;
          default: return;
        }
        result = parseFloat(result.toPrecision(12));
        currentOperand = result.toString();
        updateScreen(currentOperand);
        return;
      }

      if (isNaN(prev) || isNaN(current) || !operation) return;

      switch (operation) {
        case "+": result = prev + current; break;
        case "-": result = prev - current; break;
        case "x": result = prev * current; break;
        case "÷":
          if (current === 0) {
            updateScreen("Error");
            currentOperand = "";
            previousOperand = "";
            operation = undefined;
            clearOperatorHighlights();
            return;
          }
          result = prev / current;
          break;
        case "^": result = Math.pow(prev, current); break;
        default: return;
      }

      result = parseFloat(result.toPrecision(12));
      lastOperationHistory = operation;
      lastOperandHistory = currentOperand;
      currentOperand = result.toString();
      operation = undefined;
      previousOperand = "";
      shouldResetScreen = true;
      clearOperatorHighlights();
      updateScreen(currentOperand);
    }

    function negate() {
      if (currentOperand === "" || currentOperand === "0" || screenDisplay.textContent === "Error") return;
      currentOperand = (parseFloat(currentOperand) * -1).toString();
      clearHistory();
      updateScreen(currentOperand);
    }

    function handleSquareRoot() {
      if (currentOperand === "" || parseFloat(currentOperand) < 0 || screenDisplay.textContent === "Error") {
        updateScreen("Error");
        currentOperand = "";
        return;
      }
      currentOperand = parseFloat(Math.sqrt(parseFloat(currentOperand)).toPrecision(12)).toString();
      clearHistory();
      updateScreen(currentOperand);
    }

    function handlePercent() {
      if (currentOperand === "" || screenDisplay.textContent === "Error") return;
      currentOperand = parseFloat((parseFloat(currentOperand) / 100).toPrecision(12)).toString();
      clearHistory();
      updateScreen(currentOperand);
    }

    function handleRounding(op) {
      if (currentOperand === "" || screenDisplay.textContent === "Error") return;
      const places = (op === "R2") ? 2 : 0;
      currentOperand = parseFloat(currentOperand).toFixed(places);
      clearHistory();
      updateScreen(currentOperand);
    }

    function handlePi() {
      if (screenDisplay.textContent === "Error") clear();
      currentOperand = Math.PI.toString();
      shouldResetScreen = false;
      clearHistory();
      updateScreen(currentOperand);
    }

    function handleMemory(op) {
      if (screenDisplay.textContent === "Error" && op !== 'mc' && op !== 'mr') return;
      let currentValue = parseFloat(currentOperand);
      if (currentOperand === "") currentValue = parseFloat(screenDisplay.textContent);
      if (isNaN(currentValue) && op !== 'mr' && op !== 'mc') return;

      switch (op) {
        case 'mc': memory = 0; break;
        case 'mr':
          currentOperand = memory.toString();
          shouldResetScreen = false;
          clearHistory();
          updateScreen(currentOperand);
          break;
        case 'm+': memory += currentValue; shouldResetScreen = true; break;
        case 'm-': memory -= currentValue; shouldResetScreen = true; break;
      }
    }

    function handleBackspace() {
      if (shouldResetScreen || screenDisplay.textContent === "Error") return;
      currentOperand = currentOperand.toString().slice(0, -1);
      if (currentOperand === "") currentOperand = "0";
      updateScreen(currentOperand);
    }

    clear();

    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        let value = e.target.textContent.trim();

        if (e.target.classList.contains('C')) {
          clear();
          return;
        }

        if (e.target.classList.contains('backspace')) {
          handleBackspace();
          return;
        }

        if (value === "xy") value = "^";

        if (num.includes(value) || value === ".") {
          appendNumber(value);
        } else if (["+", "-", "x", "÷", "^"].includes(value)) {
          chooseOperation(value, e.target);
        } else if (value === "=") {
          compute();
        } else if (value === "+/-") {
          negate();
        } else if (value === "√x") {
          handleSquareRoot();
        } else if (value === "%") {
          handlePercent();
        } else if (value === "R2" || value === "R0") {
          handleRounding(value);
        } else if (value === "π") {
          handlePi();
        } else if (["mc", "mr", "m+", "m-"].includes(value)) {
          handleMemory(value);
        }
      });

    });
