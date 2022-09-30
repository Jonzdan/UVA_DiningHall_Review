//animations only pls
/*
const ajax = new XMLHttpRequest()
ajax.open("GET", "./api/ohill")
ajax.send()
ajax.onload = () => {
    const data = JSON.parse(ajax.response)
    console.log(ajax.response)
    let ifr = document.createElement('iframe')
    ifr.innerHTML = data;
    document.body.insertAdjacentElement(ifr)

    let v = document.querySelector(".shops")
    let temp = {}
    for (const obj of data) { //add all shops
        if (!(obj['stationId'] in temp)) {
            v.insertAdjacentHTML("beforeend", `<div class='shop'> <h2 class='shopName'> ${obj['stationId']} </h2> <br> </div>`)
            temp[obj['stationId']] = v.lastElementChild
        }
    }
    for (const obj of data) {
        let reference = temp[obj['stationId']]
        if (obj['stationId'] === 'Savory Stack') { // all ingredients
            reference.insertAdjacentHTML("beforeend", `<div class='ingredients'> <h2 class='ingredientName'> ${obj['MarketingName']} </h2> <br> <p class='ingredientDescription'> ${obj['ShortDescription']}</p></div>`)
        }
        else {
            reference.insertAdjacentHTML("beforeend", `<div class='item'> <h2 class='itemName'> ${obj['MarketingName']} </h2> <br> <p class='itemDescription'> ${obj['ShortDescription']}</p></div>`)
        }
    }
}
*/