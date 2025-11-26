document.addEventListener("DOMContentLoaded", pageloaded);

let txt1, txt2, btn, lblRes, op;

function pageloaded() {
    txt1 = document.getElementById("txt1");
    txt2 = document.getElementById("txt2");
    btn = document.getElementById("btnCalc");
    lblRes = document.getElementById("lblRes");
    op = document.getElementById("operation");

    btn.addEventListener("click", calculate);
}

/* ------------------ VALIDATION ------------------- */
function validateInput(el) {
    const v = el.value.trim();

    if (v !== "" && !isNaN(v)) {
        el.classList.add("is-valid");
        el.classList.remove("is-invalid");
        return true;
    } else {
        el.classList.add("is-invalid");
        el.classList.remove("is-valid");
        return false;
    }
}

/* ------------------ PRINT FUNCTION ------------------- */
function print(msg, append = false) {
    const ta = document.getElementById("output");
    if (!append)
        ta.value = msg;
    else
        ta.value += "\n" + msg;
}

/* ------------------ CALCULATE ------------------- */
function calculate() {
    const ok1 = validateInput(txt1);
    const ok2 = validateInput(txt2);

    if (!ok1 || !ok2) {
        print("Invalid input!", true);
        return;
    }

    const n1 = Number(txt1.value);
    const n2 = Number(txt2.value);
    let result;
    let opText = op.value;

    switch (opText) {
        case "add": result = n1 + n2; break;
        case "sub": result = n1 - n2; break;
        case "mul": result = n1 * n2; break;
        case "div":
            result = (n2 === 0 ? "Error (division by zero)" : n1 / n2);
            break;
    }

    lblRes.innerText = result;

    print(`(${n1}) ${op.options[op.selectedIndex].text} (${n2}) = ${result}`, true);
}

/* ------------------ NATIVE DEMO ------------------- */
function demoNative() {
    let out = "=== STEP 1: NATIVE TYPES ===\n";

    const s = "Hello World";
    out += "\n[String] " + s;
    out += "\nLength: " + s.length;
    out += "\nUpper: " + s.toUpperCase();

    const n = 42;
    out += "\n\n[Number] n = " + n;

    const b = true;
    out += "\n\n[Boolean] b = " + b;

    const d = new Date();
    out += "\n\n[Date] " + d.toISOString();

    const arr = [1, 2, 3];
    out += "\n\n[Array] [" + arr.join(", ") + "]";

    const add = (a, b) => a + b;
    out += "\n\n[Function] add(3,4) = " + add(3, 4);

    print(out);
}
