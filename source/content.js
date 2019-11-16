import browser from 'webextension-polyfill'
import { requestPermission, notify } from './notification'

const ROOT_URL = `https://rewishlist.github.io`

const getRandom = arr => {
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

const extractProduct = () => {
  const price_elem = document.querySelector('[data-tstid="priceInfo-original"]')
  const brand_elem = document.querySelector('[data-tstid="cardInfo-title"]')
  const title_elem = document.querySelector('[data-tstid="cardInfo-description"]')
  const image_elem = document.querySelector('[data-tstid="slick-active"]')

  const price = parseInt(price_elem.textContent.replace(/[^0-9]/ig, ''))
  // TODO: we lose currency information sorry
  const brand = brand_elem.textContent
  const title = title_elem.textContent
  const url = window.location.href
  const image_url = image_elem && image_elem.src

  return {
    price,
    brand,
    title,
    url,
    image_url,
    name: `${brand} ${title}`
  }
}

const notifyFoundProduct = async (product = {}, owner = {}) => {
  const result = await notify({
    title: `${owner.name} wants to refund ${product.name}`,
    body: `Get it for ${(Math.floor(product.price * 0.8))}€ at ${owner.location}`,
    icon: browser.runtime.getURL('icon.png'),
    url: `${ROOT_URL}/?product_json=${JSON.stringify(product)}`,
  })

  console.log('result', result)
}

const submitClick = async (event) => {
  const product = extractProduct()
  // show modal dialog

  showPopup(
    'DEAL OF THE CENTURY',
    `
If someone near you decides to refund this item,
we can give it to you with up to 40% discount.
Subscribe to notifications to receive ${product.name} when available.

More info at <a href="https://rewishlist.github.io/about">https://rewishlist.github.io/about</a>
    `
  )

  // We will notify you when someone would like to refund
  // ${product.name}

  // ask notification permission
  const permission = await requestPermission()

  console.log('permission', permission)

  if (permission == 'granted') {
    // await notify({
    //   title: `Subscribed!`,
    //   body: `We'll notify you when ${product.name} will be available!`,
    //   icon: browser.runtime.getURL('icon.png'),
    //   url: ``,
    // })

    closePopup()
  } else {
    return
  }

  // notify in 5 seconds
  setTimeout(() => {
    const owner = {
      name: getRandom(['Jamie', 'George', 'James']),
      location: 'Espoo, Finland (1km)',
    }

    notifyFoundProduct(product, owner)
  }, 8000)

  // window.open(`${ROOT_URL}/?product_json=${JSON.stringify(product)}`)
}

const insertButton = () => {
  const button = document.createElement('button')

  button.innerHTML = `
    <div class="btn-rewishlist-discount-block">
      <span class="btn-rewishlist-discount">-20%</span>
    </div>
    <div class="btn-rewishlist-text-block">
      <span class="btn-rewishlist-text">
        Shop at
        <span class="btn-rewishlist-brand">
          +Rewishlist
        </span>
      </span>
    </div>
  `

  button.className = 'btn btn-rewishlist'

  button.onclick = submitClick

  const productOffer = document.querySelector('[data-tstid=productOffer]')

  if (productOffer) {
    productOffer.appendChild(button)
  } else {
    document.body.appendChild(button)
  }

}

const insertPopupContainer = () => {
  const popupContainer = document.createElement('div')

  popupContainer.innerHTML = `
    <div class="rewishlist-popup-window">
      <div class="rewishlist-popup-title">
        Popup Title
      </div>

      <div class="rewishlist-popup-body">
        Full Text
      </div>
    </div>
  `

  popupContainer.className = 'rewishlist-popup-container'

  const wrapper = document.querySelector('.wrapper')

  if (wrapper) {
    wrapper.appendChild(popupContainer)
  } else {
    console.log('Not supported on this website')
  }
}

const closePopup = () => {
  const popupContainerElem = document.querySelector('.rewishlist-popup-container')

  popupContainerElem.style.display = 'none'
}

const showPopup = (title, body = '') => {
  const popupContainerElem = document.querySelector('.rewishlist-popup-container')
  const popupElem = document.querySelector('.rewishlist-popup-window')
  const popupTitleElem = document.querySelector('.rewishlist-popup-title')
  const popupBodyElem = document.querySelector('.rewishlist-popup-body')

  popupTitleElem.innerText = title
  popupBodyElem.innerHTML = body

  popupContainerElem.onclick = closePopup
  popupBodyElem.onclick = (event) => {
    event.stopPropagation()
  }

  popupContainerElem.style.display = 'block'
}

window.closePopup = closePopup
window.onload = function () {
  insertButton()
  insertPopupContainer()
}
