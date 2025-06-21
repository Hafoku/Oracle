import axios from "axios";

axios.defaults.baseURL = 'http://2.133.132.170:8082'
axios.defaults.headers.post["Content-Type"] = "application/json"

export const request = (method, url, data) => {
    return axios({
        method: method,
        url: url,
        data: data
    })
}