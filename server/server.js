const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(bodyparser.json());
app.use(cors());

const port = 8000;

let conn = null;

// สร้างการเชื่อมต่อ MySQL
const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'webdb',
    port: 8700
  });
};

// ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
const validateData = (studentData) => {
  let errors = [];
  if (!studentData.firstname) {
    errors.push('กรุณากรอกชื่อ');
  }
  if (!studentData.lastname) {
    errors.push('กรุณากรอกนามสกุล');
  }
  if (!studentData.age) {
    errors.push('กรุณากรอกอายุ');
  }
  if (!studentData.address) {
    errors.push('กรุณากรอกที่อยู่');
  }
  if (!studentData.education_level) {
    errors.push('กรุณาเลือกระดับการศึกษา');
  }
  if (!studentData.subject) {
    errors.push('กรุณากรอกชื่อวิชา');
  }
  if (!studentData.grade) {
    errors.push('กรุณากรอกเกรด');
  }
  if (!studentData.extralearningactivities) {
    errors.push('กรุณากรอกกิจกรรมเสริมการเรียน');
  }
  if (!studentData.teacherfirstname) {
    errors.push('กรุณากรอกชื่ออาจารย์ผู้สอน');
  }
  if (!studentData.teacherlastname) {
    errors.push('กรุณากรอกนามสกุลอาจารย์ผู้สอน');
  }
  if (!studentData.course) {
    errors.push('กรุณากรอกวิชาที่สอน');
  }
  if (!studentData.time) {
    errors.push('กรุณากรอกเวลาการสอน');
  }

  return errors;
};

// GET /students - ดึงข้อมูลนักเรียนทั้งหมด + รองรับการค้นหา + รองรับการกรองตามระดับการศึกษา
app.get('/students', async (req, res) => {
  try {
    const rawSearch = req.query.search || '';
    const level = req.query.level || '';
    // แปลง keyword เป็นตัวพิมพ์เล็ก + trim
    const search = rawSearch.trim().toLowerCase();

    // สร้าง SQL เบื้องต้น โดยเริ่มจากเงื่อนไข WHERE 1=1 เพื่อให้ต่อเงื่อนไขอื่นง่าย
    let sql = 'SELECT * FROM students WHERE 1=1';
    let params = [];

    console.log('DEBUG:', { rawSearch, level, search }); // ลองดูว่าค่าออกมาถูกมั้ย

    // ถ้ามีคีย์เวิร์ด search ให้กรองจาก firstname, lastname
    if (search !== '') {
      sql += ' AND (LOWER(firstname) LIKE ? OR LOWER(lastname) LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // ถ้ามีค่า level และไม่ใช่ค่าว่าง ให้กรองตาม education_level
    if (level !== '') {
      sql += ' AND education_level = ?';
      params.push(level);
    }

    // ดึงข้อมูลจาก DB
    const [rows] = await conn.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Search error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /students - สร้างนักเรียนใหม่
app.post('/students', async (req, res) => {
  try {
    let student = req.body;

    const errors = validateData(student);
    if (errors.length > 0) {
      throw {
        message: 'กรอกข้อมูลไม่ครบ',
        errors: errors
      };
    }

    const results = await conn.query('INSERT INTO students SET ?', student);
    res.json({
      message: 'insert ok',
      data: results[0]
    });
  } catch (error) {
    const errorMessage = error.message || 'something wrong';
    const errors = error.errors || [];
    console.error('error message', error.message);
    res.status(500).json({
      message: errorMessage,
      errors: errors
    });
  }
});

// GET /students/:id - ดึงข้อมูลนักเรียนรายบุคคล
app.get('/students/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const [rows] = await conn.query('SELECT * FROM students WHERE id = ?', [id]);

    if (rows.length == 0) {
      return res.status(404).json({ message: 'หาไม่เจอ' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('error message', error.message);
    let statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: 'something wrong',
      errorMessage: error.message
    });
  }
});

// PUT /students/:id - อัปเดตข้อมูลนักเรียนรายบุคคล
app.put('/students/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let updateStudent = req.body;

    const [result] = await conn.query(
      'UPDATE students SET ? WHERE id = ?',
      [updateStudent, id]
    );

    // ตรวจสอบว่าแก้ไขได้จริงหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลที่จะอัปเดต' });
    }

    res.json({
      message: 'update ok',
      data: result
    });
  } catch (error) {
    console.error('error message', error.message);
    res.status(500).json({
      message: 'something wrong'
    });
  }
});

// DELETE /students/:id - ลบนักเรียนตาม id
app.delete('/students/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const [result] = await conn.query('DELETE FROM students WHERE id = ?', [parseInt(id)]);

    // ตรวจสอบว่าลบได้จริงหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลที่จะลบ' });
    }

    res.json({
      message: 'delete ok',
      data: result
    });
  } catch (error) {
    console.error('error message', error.message);
    res.status(500).json({
      message: 'something wrong'
    });
  }
});



// เริ่มต้นเปิด server + เชื่อมต่อ DB
app.listen(port, async () => {
  await initMySQL();
  console.log('http server run at port ' + port);
});
