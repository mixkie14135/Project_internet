const BASE_URL = 'http://localhost:8000';

// โหลดข้อมูลนักเรียนทั้งหมดเมื่อหน้าเว็บโหลด
window.onload = async () => {
  await loadData();
};

// โหลดข้อมูลทั้งหมด
const loadData = async () => {
  console.log('loaded');
  try {
    const response = await axios.get(`${BASE_URL}/students`);
    renderStudents(response.data);
  } catch (err) {
    console.error('Load data error:', err);
  }
};

// ฟังก์ชันค้นหาและกรอง
const searchStudents = async () => {
  const keyword = document.getElementById('searchInput').value.trim();
  const level = document.getElementById('filterLevel').value;
  const warning = document.getElementById('searchWarning');

  warning.style.display = 'none';

  try {
    let url = `${BASE_URL}/students?search=${encodeURIComponent(keyword)}`;
    if (level) {
      url += `&level=${encodeURIComponent(level)}`;
    }

    const response = await axios.get(url);
    const students = response.data;

    if (students.length === 0) {
      warning.innerText = 'ไม่พบนักเรียนที่ตรงกับคำค้นหา';
      warning.style.display = 'block';
    }

    renderStudents(students);
  } catch (err) {
    console.error('Search error:', err);
  }
};

// กรองระดับชั้น
const filterByLevel = async () => {
  await searchStudents();
};

// Reset ทุกอย่าง
const resetFilters = async () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterLevel').value = '';
  document.getElementById('searchWarning').style.display = 'none';
  await loadData();
};

// แสดงผลนักเรียน
const renderStudents = (students) => {
  const studentDOM = document.getElementById('student');
  let htmlData = '<div>';

  for (let student of students) {
    htmlData += `
      <div class="student-card">
        <div class="student-details">
          <div class="student-name">${student.firstname} ${student.lastname}</div>
          <div class="student-meta">
            📚 ชั้นปี: ${student.education_level || '-'} |
            🎂 อายุ: ${student.age || '-'}
          </div>
        </div>
        <div class="student-actions">
          <a href="view.html?id=${student.id}">
            <button class="view-btn">View</button>
          </a>
          <a href="index.html?id=${student.id}">
            <button class="edit-btn">Edit</button>
          </a>
          <button class="delete-btn" data-id="${student.id}" data-firstname="${student.firstname}" data-lastname="${student.lastname}">Delete</button>
        </div>
      </div>
    `;
  }

  htmlData += '</div>';
  studentDOM.innerHTML = htmlData;

  // Event ลบ
  const deleteDOMs = document.getElementsByClassName('delete-btn');
  for (let btn of deleteDOMs) {
    btn.addEventListener('click', async (event) => {
      const id = event.target.dataset.id;
      const firstname = event.target.dataset.firstname;
      const lastname = event.target.dataset.lastname;

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
        await loadData();

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
