const BASE_URL = 'http://localhost:8000'

let mode = 'CREATE'
let selectedId = ''

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')
    if (id) {
        mode = 'EDIT'
        selectedId = id

        try {
            const response = await axios.get(`${BASE_URL}/students/${id}`)
            const student = response.data

            let firstnameDOM = document.querySelector('input[name=firstname]')
            let lastnameDOM = document.querySelector('input[name=lastname]')
            let ageDOM = document.querySelector('input[name=age]')
            let addressDOM = document.querySelector('textarea[name=address]')
            let subjectDOM = document.querySelector('input[name=subject]')
            let extralearningactivitiesDOM = document.querySelector('textarea[name=extralearningactivities]')
            let teacherfirstnameDOM = document.querySelector('input[name=teacherfirstname]')
            let teacherlastnameDOM = document.querySelector('input[name=teacherlastname]')
            let courseDOM = document.querySelector('input[name=course]')
            let timeDOM = document.querySelector('input[name=time]')

            const date = new Date(student.time);
            const datedata = date.toISOString().split('T')[0];
            student.time = datedata

            firstnameDOM.value = student.firstname
            lastnameDOM.value = student.lastname
            ageDOM.value = student.age
            addressDOM.value = student.address
            subjectDOM.value = student.subject
            extralearningactivitiesDOM.value = student.extralearningactivities
            teacherfirstnameDOM.value = student.teacherfirstname
            teacherlastnameDOM.value = student.teacherlastname
            courseDOM.value = student.course
            timeDOM.value = student.time

            let education_levelDOMs = document.querySelectorAll('input[name=education_level]')
            let gradeDOMs = document.querySelectorAll('input[name=grade]')

            for (let i = 0; i < education_levelDOMs.length; i++) {
                if (education_levelDOMs[i].value == student.education_level) {
                    education_levelDOMs[i].checked = true
                }
            }

            for (let i = 0; i < gradeDOMs.length; i++) {
                if (gradeDOMs[i].value == student.grade) {
                    gradeDOMs[i].checked = true
                }
            }

        } catch (error) {
            console.log('error', error)
        }
    }
}

const validateData = (studentData) => {
    let errors = []
    if (!studentData.firstname) errors.push('กรุณากรอกชื่อ')
    if (!studentData.lastname) errors.push('กรุณากรอกนามสกุล')
    if (!studentData.age) errors.push('กรุณากรอกอายุ')
    if (!studentData.address) errors.push('กรุณากรอกที่อยู่')
    if (!studentData.education_level) errors.push('กรุณาเลือกระดับการศึกษา')
    if (!studentData.subject) errors.push('กรุณากรอกชื่อวิชา')
    if (!studentData.grade) errors.push('กรุณากรอกเกรด')
    if (!studentData.extralearningactivities) errors.push('กรุณากรอกกิจกรรมเสริมการเรียน')
    if (!studentData.teacherfirstname) errors.push('กรุณากรอกชื่ออาจารย์ผู้สอน')
    if (!studentData.teacherlastname) errors.push('กรุณากรอกนามสกุลอาจารย์ผู้สอน')
    if (!studentData.course) errors.push('กรุณากรอกวิชาที่สอน')
    if (!studentData.time) errors.push('กรุณากรอกเวลาการสอน')
    return errors
}

const submitData = async () => {
    let firstnameDOM = document.querySelector('input[name=firstname]')
    let lastnameDOM = document.querySelector('input[name=lastname]')
    let ageDOM = document.querySelector('input[name=age]')
    let addressDOM = document.querySelector('textarea[name=address]')
    let education_levelDOM = document.querySelector('input[name=education_level]:checked') || {}
    let subjectDOM = document.querySelector('input[name=subject]')
    let gradeDOM = document.querySelector('input[name=grade]:checked') || {}
    let extralearningactivitiesDOM = document.querySelector('textarea[name=extralearningactivities]')
    let teacherfirstnameDOM = document.querySelector('input[name=teacherfirstname]')
    let teacherlastnameDOM = document.querySelector('input[name=teacherlastname]')
    let courseDOM = document.querySelector('input[name=course]')
    let timeDOM = document.querySelector('input[name=time]')

    try {
        let studentData = {
            firstname: firstnameDOM.value,
            lastname: lastnameDOM.value,
            age: ageDOM.value,
            address: addressDOM.value,
            education_level: education_levelDOM.value,
            subject: subjectDOM.value,
            grade: gradeDOM.value,
            extralearningactivities: extralearningactivitiesDOM.value,
            teacherfirstname: teacherfirstnameDOM.value,
            teacherlastname: teacherlastnameDOM.value,
            course: courseDOM.value,
            time: timeDOM.value
        }

        const errors = validateData(studentData)
        if (errors.length > 0) {
            throw { message: 'กรอกข้อมูลไม่ครบ!', errors }
        }

        let message = 'บันทึกข้อมูลสำเร็จ!'
        if (mode === 'CREATE') {
            await axios.post(`${BASE_URL}/students`, studentData)
        } else {
            await axios.put(`${BASE_URL}/students/${selectedId}`, studentData)
            message = 'แก้ไขข้อมูลสำเร็จ!'
        }

        Swal.fire({
            icon: 'success',
            title: message,
            showConfirmButton: false,
            timer: 1500
        })

        document.querySelector('form').reset()

    } catch (error) {
        if (error.response) {
            error.message = error.response.data.message
            error.errors = error.response.data.errors
        }

        Swal.fire({
            icon: 'error',
            title: error.message || 'เกิดข้อผิดพลาดบางอย่าง',
            html: `<ul style="text-align: left;">${(error.errors || []).map(e => `<li>${e}</li>`).join('')}</ul>`
        })
    }
}
