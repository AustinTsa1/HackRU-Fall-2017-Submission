function validate(){
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	console.log("button clicked");

	if (document.querySelector('input[name=email]').value == null){
		document.querySelector('div#form-alert').innerHTML = "Please enter an email.";
		document.querySelector('div#form-alert').style.display = "inline";
		return;
	} else if (document.querySelector('input[name=password]').value == null){
		document.querySelector('div#form-alert').innerHTML = "Please enter a password.";
		document.querySelector('div#form-alert').style.display = "inline";
		return;
	}

	var email = document.querySelector('input[name=email]').value;

	if (re.test(email)){
		document.querySelector('form#signup-form').submit();
	} else {
		document.querySelector('div#form-alert').innerHTML = "Please enter a valid email.";
		document.querySelector('div#form-alert').style.display = "inline";
	}
	return;
}

document.querySelector('button#submit-button').onclick = validate();
