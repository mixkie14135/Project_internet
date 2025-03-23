const express = require('express')
const bodyparser = require('body-parser')
const mysql = require('mysql2/promise')
const cors = require('cors')
const app = express()

app.use(bodyparser.json())
app.use(cors())

const port = 8000


let conn = null

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'webdb',
    port: 8700
  })
}

const validateData = (studentData) => {
  let errors = []
  if (!studentData.firstname) {
    errors.push('กรุณากรอกชื่อ')
  }
  if (!studentData.lastname) {
    errors.push('กรุณากรอกนามสกุล')
  }
  if (!studentData.age) {
    errors.push('กรุณากรอกอายุ')
  }
  if (!studentData.address) {
    errors.push('กรุณากรอกที่อยู่')
  }
  if (!studentData.education_level) {
    errors.push('กรุณาเลือกระดับการศึกษา')
  }
  if (!studentData.subject) {
    errors.push('กรุณากรอกชื่อวิชา')
  }
  if (!studentData.grade) {
    errors.push('กรุณากรอกเกรด')
  }
  if (!studentData.extralearningactivities) {
    errors.push('กรุณากรอกกิจกรรมเสริมการเรียน')
  }
  if (!studentData.teacherfirstname) {
    errors.push('กรุณากรอกชื่ออาจารย์ผู้สอน')
  }
  if (!studentData.teacherlastname) {
    errors.push('กรุณากรอกนามสกุลอาจารย์ผู้สอน')
  }
  if (!studentData.course) {
    errors.push('กรุณากรอกวิชาที่สอน')
  }
  if (!studentData.time) {
    errors.push('กรุณากรอกเวลาการสอน')
  }
  

  return errors
}



// path = GET /students สำหรับ get students ทั้งหมดที่บันทึกเข้าไปออกมา
app.get('/students', async (req, res) => {
  const results = await conn.query('SELECT * FROM students')
  res.json(results[0])
})

// path = POST /students สำหรับการสร้าง students ใหม่บันทึกเข้าไป
app.post('/students', async (req, res) => {
  try {
      let student = req.body

      const errors = validateData(student)
      if (errors.length > 0) {
        throw { 
          message: 'กรอกข้อมูลไม่ครบ',
          errors: errors }
      }
      const results = await conn.query('INSERT INTO students SET ?', student)
      res.json({
        message: 'insert ok',
        data: results[0]
      })
  } catch (error) {
      const errorMessage = error.message || 'something wrong'
      const errors = error.errors || []
      console.error('error message', error.message)
      res.status(500).json({
        message: errorMessage,
        errors: errors
      })
  }
})

// GET /students/:id สำหรับการดึง students รายคนออกมา
app.get('/students/:id', async (req, res) => {
  try {
    let id = req.params.id
    const results = await conn.query('SELECT * FROM students WHERE id = ?', id)

    if (results[0].length == 0) {
      throw { statusCode: 404, message: 'หาไม่เจอ' }
    }

    res.json(results[0][0])
  } catch (error) {
    console.error('error message', error.message)
    let statusCode = error.statusCode || 500
    res.status(statusCode).json({
      message: 'something wrong',
      errorMessage: error.message
    })
  }
})

// path = PUT /students/:id สำหรับการแก้ไข students รายคน (ตาม id ที่บันทึกเข้าไป)
app.put('/students/:id', async (req, res) => {
  try {
    let id = req.params.id
    let updateStudent = req.body
    const results = await conn.query(
      'UPDATE students SET ? WHERE id = ?',
      [updateStudent, id]
    )
    res.json({
      message: 'update ok',
      data: results[0]
    })
  } catch (error) {
    console.error('error message', error.message)
    res.status(500).json({
      message: 'something wrong'
    })
  }
})


// path DELETE /students/:id สำหรับการลบ students รายคน (ตาม id ที่บันทึกเข้าไป)
app.delete('/students/:id', async (req, res) => {
  try {
    let id = req.params.id
    const results = await conn.query('DELETE from students WHERE id = ?', parseInt(id))
    res.json({
      message: 'delete ok',
      data: results[0]
    })
  } catch (error) {
    console.error('error message', error.message)
    res.status(500).json({
      message: 'something wrong'
    })
  }
})

app.listen(port, async (req, res) => {
  await initMySQL()
  console.log('http server run at ' + port)
})