const BASE_URL = 'http://localhost:8000';

// เมื่อหน้าเว็บโหลดเสร็จ จะดึงข้อมูลนักเรียนทั้งหมดมาแสดงก่อน
window.onload = async () => {
  await loadData();
};

// ดึงข้อมูลนักเรียนทั้งหมด (ไม่กรอง ไม่ค้นหา)
const loadData = async () => {
  console.log('loaded');
  try {
    const response = await axios.get(`${BASE_URL}/students`);
    renderStudents(response.data);
  } catch (err) {
    console.error('Load data error:', err);
  }
};

// ฟังก์ชันหลักสำหรับการค้นหา + กรอง
// อ่านค่า keyword จากช่อง search และ level จาก dropdown
const searchStudents = async () => {
  const keyword = document.getElementById('searchInput').value.trim();
  const level = document.getElementById('filterLevel').value;
  const warning = document.getElementById('searchWarning');

  // ซ่อนข้อความเตือน "ไม่พบนักเรียน" ก่อน
  warning.style.display = 'none';

  try {
    // สร้าง URL สำหรับเรียก API ถ้ามี search หรือ level ก็ให้ต่อ query string เข้าไป
    let url = `${BASE_URL}/students?search=${encodeURIComponent(keyword)}`;
    if (level) {
      url += `&level=${encodeURIComponent(level)}`;
    }

    // เรียก GET ไปที่ API
    const response = await axios.get(url);
    const students = response.data;

    // ถ้าไม่พบข้อมูลนักเรียนเลย ให้แสดงข้อความเตือน
    if (students.length === 0) {
      warning.innerText = 'ไม่พบนักเรียนที่ตรงกับคำค้นหา';
      warning.style.display = 'block';
    }

    // แสดงผลลัพธ์บนหน้าเว็บ
    renderStudents(students);
  } catch (err) {
    console.error('Search error:', err);
  }
};

// ฟังก์ชันเมื่อมีการเปลี่ยน dropdown ระดับการศึกษา
// เลือกใช้ฟังก์ชัน searchStudents() เพื่อให้การค้นหา + กรอง ใช้โค้ดเดียวกัน
const filterByLevel = async () => {
  await searchStudents();
};

// ฟังก์ชันที่ใช้ในการ render ข้อมูลนักเรียนบนหน้าเว็บ
const renderStudents = (students) => {
  const studentDOM = document.getElementById('student');
  let htmlData = '<div>';

  for (let i = 0; i < students.length; i++) {
    let student = students[i];
    htmlData += `
      <div>
        ${student.id} ${student.firstname} ${student.lastname} ${student.age}
        <a href='index.html?id=${student.id}'><button>Edit</button></a>
        <button class='delete' data-id='${student.id}' data-firstname='${student.firstname}' data-lastname='${student.lastname}'>Delete</button>
      </div>
    `;
  }

  htmlData += '</div>';
  studentDOM.innerHTML = htmlData;

  // ผูก event สำหรับปุ่มลบ
  const deleteDOMs = document.getElementsByClassName('delete');
  for (let i = 0; i < deleteDOMs.length; i++) {
    deleteDOMs[i].addEventListener('click', async (event) => {
      const id = event.target.dataset.id;
      const firstname = event.target.dataset.firstname;
      const lastname = event.target.dataset.lastname;

      // แจ้งเตือน SweetAlert2 ก่อนลบ
      const result = await Swal.fire({
        title: 'ลบนักเรียน?',
        text: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${firstname} ${lastname}" ออกจากระบบ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย',
        cancelButtonText: 'ยกเลิก'
      });

      if (!result.isConfirmed) return;

      try {
        await axios.delete(`${BASE_URL}/students/${id}`);
        await loadData(); // โหลดข้อมูลใหม่ (แสดงผลล่าสุด)

        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ!',
          text: `"${firstname} ${lastname}" ถูกลบออกจากระบบแล้ว`,
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.log(error);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบนักเรียนได้', 'error');
      }
    });
  }
};
