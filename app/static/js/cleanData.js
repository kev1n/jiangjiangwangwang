const buttons = document.getElementsByTagName("button");

function escapeSpecialCharacters(str) {

    //loop through each character in the string
    let newStr = "";
    let specialCharacters = ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "{", "}", "]", "[", "|", "\\", "`", ",", ".", "/", "?", ";", ":", "'", "\"", "<", ">"]
    for (let i = 0; i < str.length; i++) {
        //get the current character
        const currentChar = str[i];
        //check if the current character is any special character
        if (specialCharacters.includes(currentChar)) {
            //if it is, add a backslash before it
            newStr += "\\" + currentChar;
        } else {
            //if it is not, just add the character
            newStr += currentChar;
        }
    }
    return newStr;
}

for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    if (button.hasAttribute("data-bs-target")) {
      const buttonTarget = String(button.getAttribute("data-bs-target"));
      const escapedTarget = "#" + escapeSpecialCharacters(buttonTarget.substring(1));
      button.setAttribute("data-bs-target", escapedTarget);
    }
  }

// same treatment for a tag
const aTags = document.getElementsByTagName("a");
for (let i = 0; i < aTags.length; i++) {
    const aTag = aTags[i];
    if (aTag.hasAttribute("data-bs-target")) {
        const aTagTarget = String(aTag.getAttribute("data-bs-target"));
        const escapedTarget = "#" + escapeSpecialCharacters(aTagTarget.substring(1));
        aTag.setAttribute("data-bs-target", escapedTarget);
    }
}