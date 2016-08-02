# code-along
A tool for interactive "code-together" javascript workshops

## API

* `GET /create` - form for making new sessions
* `GET /admin/:key` - super-admin form
* `PUT /admin/:key` - super-admin changes
* `GET /content/:key` - the current content for a key
* `PUT /content/:key` - (requires session to be authed)

# Todo

* Better name / url
* Offline support
