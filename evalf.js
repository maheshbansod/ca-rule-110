//@ts-check

/**
* Evaluates rule 110 on the input
* returns output string which is of same length as input
* @param {string|string[]} input
*/
export function evalinput(input) {
  var output = [...("0".repeat(input.length))];
  var i = input.length;
  var len = 0;
  while (i > 0) {
    i--;
    if (input[i] == "1") {
      output[i] = "1";
      len = i;
      break;
    }
  }
  var is1;
  for (var i = 1; i < len; i++) {
    is1 = true;
    if (input[i - 1] == "1") {
      if (input[i] == input[i + 1])
        is1 = false;
    } else if (input[i + 1] == input[i] && input[i] == "0")
      is1 = false;
    if (is1)
      output[i] = "1";
    else output[i] = "0";
  }
  if (!(input[0] == input[1] && input[0] == "0")) {
    output[0] = "1";
  }
  return output
}
