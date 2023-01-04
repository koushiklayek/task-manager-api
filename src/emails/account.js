const mailgun = require("mailgun-js")

const apikey = process.env.MAILGUN_API_KEY
const domain = process.env.MAILGUN_DOMAIN

const mg = mailgun({ apiKey: apikey, domain: domain })

// send the data got from welcome or cancellation methods
const sendEmail = (data) => {
    mg.messages().send(data, function (error, body) {
        if (error) {
            return console.log(error)
        }
        console.log(body)
    })
}

// used to send welocme email when user joins first time
const sendWelcomeEmail = (email, name) => {
    const data = {
        from: "K L <layekkoushik2203@gmail.com>",
        to: email,
        subject: "Thanks for joining in!",
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    }
    sendEmail(data)
}

// used to send cancellation email when user deletes their account
const sendCancellationEmail = (email, name) => {
    const data = {
        from: "K L <layekkoushik2203@gmail.com>",
        to: email,
        subject: "Sorry to see you go",
        text: `Good bye, ${name}. We hope to see you back sometime soon.`
    }
    sendEmail(data)
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}