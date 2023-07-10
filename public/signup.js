const signupform = document.getElementById('signupform')

async function signup(name, email, phone, password) {
    try {
        let user = {
            name,
            email,
            phone,
            password
        }
        await axios.post("http://localhost:3000/user/signup", user)
        alert("SIGNUP SUCCESSFUL")
        window.location.href="login.html"
    }
    catch (err) {
        const p = document.createElement('p')
        p.textContent = "Email already registered, Please Login"
        signupform.appendChild(p)
    }
}

signupform.addEventListener('submit', (e) => {
    e.preventDefault()

    let name = document.getElementById('name').value
    let email = document.getElementById('email').value
    let phone = document.getElementById('phone').value
    let password = document.getElementById('password').value

    signup(name, email, phone, password)

    name = ""
    email = ""
    phone = ""
    password = ""
})