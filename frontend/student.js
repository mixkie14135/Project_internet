const BASE_URL = 'http://localhost:8000'


window.onload = async () => {
   await loadData()
}

const loadData = async () => {
    console.log('loaded');
    const response = await axios.get(`${BASE_URL}/students`)
    console.log(response.data);

    const studentDOM = document.getElementById('student')

    let htmlData = '<div>'
    for (let i = 0; i < response.data.length; i++) {
        let student = response.data[i]
        htmlData += `<div>
        ${student.id} ${student.firstname} ${student.lastname} ${student.age}
        <a href='index.html?id=${student.id}'><button>Edit</button></a>
        <button class ='delete' data-id='${student.id}'>Delete</button>
        <div>`
    }
    htmlData += '<div>'
    studentDOM.innerHTML = htmlData

    const deleteDOMs = document.getElementsByClassName('delete')
    for (let i = 0; i < deleteDOMs.length; i++) {
        deleteDOMs[i].addEventListener('click', async (event) => {
            const id = event.target.dataset.id
            try {
                await axios.delete(`${BASE_URL}/students/${id}`)
                loadData() //recursive function = เรียกฟังก์ชันตัวเองซ้ำ
            } catch (error) {
                console.log(error);
            }
        })
    }
}