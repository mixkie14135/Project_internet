const BASE_URL = 'http://localhost:8000'


window.onload = async () => {
  await loadData()
}

const loadData = async () => {
  console.log('loaded')
  const response = await axios.get(`${BASE_URL}/students`)
  renderStudents(response.data)
}

const searchStudents = async () => {
    const keyword = document.getElementById('searchInput').value.trim()
    const warning = document.getElementById('searchWarning')
    warning.style.display = 'none' // reset ทุกครั้งก่อนค้น
  
    try {
      const response = await axios.get(`${BASE_URL}/students?search=${encodeURIComponent(keyword)}`)
      const students = response.data
  
      if (students.length === 0) {
        warning.innerText = 'ไม่พบนักเรียนที่ตรงกับคำค้นหา'
        warning.style.display = 'block'
      }
  
      renderStudents(students)
    } catch (err) {
      console.error('Search error:', err)
    }
  }
  

const renderStudents = (students) => {
  const studentDOM = document.getElementById('student')
  let htmlData = '<div>'

  for (let i = 0; i < students.length; i++) {
    let student = students[i]
    htmlData += `<div>
      ${student.id} ${student.firstname} ${student.lastname} ${student.age}
      <a href='index.html?id=${student.id}'><button>Edit</button></a>
      <button class='delete' data-id='${student.id}' data-firstname='${student.firstname}' data-lastname='${student.lastname}'>Delete</button>
    </div>`
  }

  htmlData += '</div>'
  studentDOM.innerHTML = htmlData

  const deleteDOMs = document.getElementsByClassName('delete')
  for (let i = 0; i < deleteDOMs.length; i++) {
    deleteDOMs[i].addEventListener('click', async (event) => {
      const id = event.target.dataset.id
      const firstname = event.target.dataset.firstname
      const lastname = event.target.dataset.lastname
  
      const result = await Swal.fire({
        title: 'ลบนักเรียน?',
        text: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${firstname} ${lastname}" ออกจากระบบ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย',
        cancelButtonText: 'ยกเลิก'
      })
  
      if (!result.isConfirmed) return
  
      try {
        await axios.delete(`${BASE_URL}/students/${id}`)
        await loadData()
  
        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ!',
          text: `"${firstname} ${lastname}" ถูกลบออกจากระบบแล้ว`,
          timer: 1500,
          showConfirmButton: false
        })
      } catch (error) {
        console.log(error)
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบนักเรียนได้', 'error')
      }
    })
  }  
} 

