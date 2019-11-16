// request permission on page load
export const requestPermission = () => {
  if (!Notification) {
    return Promise.reject('Desktop notifications not available in your browser.')
  }

  if (Notification.permission !== 'granted')
    return Notification.requestPermission()
  else
    return Promise.resolve('granted')
}

export const notify = ({
  title, body,
  icon = '',
  url = '',
} = {}) => {
  if (Notification.permission !== 'granted') {
    // Notification.requestPermission()
    return Promise.reject('No permission')
  } else {
    const notification = new Notification(title, {
      icon,
      body,
    })

    if (url) {
      notification.onclick = () => {
        window.open(url)
      }
    }

    Promise.resolve(notification)
  }
}
