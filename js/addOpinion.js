/*
 * Created by Stefan Korecko, 2020-21
 * Opinions form processing functionality
 */

/*
This function works with the form:

<form id="opnFrm">
    <label for="nameElm">Your name:</label>
    <input type="text" name="login" id="nameElm" size="20" maxlength="50" placeholder="Enter your name here" required />
    <br><br>
    <label for="opnElm">Your opinion:</label>
    <textarea name="comment" id="opnElm" cols="50" rows="3" placeholder="Express your opinion here" required></textarea>
    <br><br>
    <input type="checkbox" id="willReturnElm" />
    <label for="willReturnElm">I will definitely return to this page.</label>
    <br><br>
    <button type="submit">Send</button>
</form>

 */
export default function processOpnFrmData(event){
    //1.prevent normal event (form sending) processing
    event.preventDefault();
    validateForm();

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    const Name = document.getElementById("name").value.trim();
    const Email = document.getElementById("email").value.trim();
    const Url = document.getElementById("url").value.trim();
    const Opinion = document.getElementById("opinion").value.trim();

    const Recommendation = document.querySelector('input[name="recommendation"]:checked');
    const RecommendationValue = Recommendation ? Recommendation.value : null;
    const Futbal = document.getElementById("Futbal").checked;
    const Hokej = document.getElementById("Hokej").checked;
    const Tenis = document.getElementById("Tenis").checked;
    const Iné = document.getElementById("Iné").checked;

    const ArrayInput = document.querySelector('input[name="array"]');
    const ArrayValue = ArrayInput ? ArrayInput.value : null;

    //3. Add the data to the array opinions and local storage
    if(Name != "" && Email != "" && Opinion != ""){
        const newOpinion = {
          name: Name,
          email: Email,
          url: Url,
          opinion: Opinion,
          recommendation: RecommendationValue,
          futbal: Futbal,
          hokej: Hokej,
          tenis: Tenis,
          iné: Iné,
          array: ArrayValue,    
          created: new Date()
        };


        let opinions = [];

        if(localStorage.myTreesComments){
            opinions=JSON.parse(localStorage.myTreesComments);
        }

        opinions.push(newOpinion);
        localStorage.myTreesComments = JSON.stringify(opinions);


        //5. Go to the opinions
        window.location.hash="#opinions";

    }

}

function validateForm() {
    const Name = document.getElementById("name").value.trim();
    const Email = document.getElementById("email").value;
    const Opinion = document.getElementById("opinion").value.trim();
  
    var errorName = false;
    var errorEmail = false;
    var errorOpinion = false;
  
    if (Name === "") {
      errorName = true;
      displayError("Meno je potrebné vyplniť", "nameError");
    }
  
    else if(Name != ""){
      errorName = false;
      removeError("nameError");
    }
  
    if (Email === "") {
      errorEmail = true;
      displayError("E-mail je potrebné vyplniť", "emailError");
    }
  
    else if(Email != ""){
      errorEmail = false;
      removeError("emailError");
    }
  
  
  
    if (Opinion === "") {
      errorOpinion = true;
      displayError("Názor je potrebné vyplniť", "opinionError");
    }
  
    else if(Opinion != ""){
      errorOpinion = false;
      removeError("opinionError");
    }
   
    if (errorName || errorEmail || errorOpinion) {
      return false;
    }
  
    // Remove error divs if all fields are filled
    removeError("nameError");
    removeError("emailError");
    removeError("opinionError");
  
    return true;
  }
  
  function displayError(errorMessage, errorId) {
    // Check if the error div already exists
    var errorDiv = document.getElementById(errorId);
  
    if (!errorDiv) {
      // Create a new div element
      errorDiv = document.createElement("div");
      errorDiv.id = errorId;
      errorDiv.className = "alert alert-warning alert-dismissible"; // You can set your own class for styling
  
      // Append the error message to the div
      errorDiv.innerText = errorMessage;
  
      // Append the error div to the form
      document.querySelector('form').appendChild(errorDiv);
      
    } else {
      // Update the existing error div with a new message
      errorDiv.innerText = errorMessage;
    }
  }
  
  function removeError(errorId) {
    var errorDiv = document.getElementById(errorId);
    if (errorDiv) {
      // Remove the error div if it exists
      errorDiv.remove();
    }
  }
