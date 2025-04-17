import homeService from "./../services/homeService";
import userService from "./../services/userService";
import clinicService from "./../services/clinicService";
import specializationService from "./../services/specializationService";
import supporterService from "./../services/supporterService";
import doctorService from "./../services/doctorService";
import multer from "multer";
const db = require('../models');


let getManageDoctor = async (req, res) => {
    let doctors = await userService.getInfoDoctors();
    return res.render("main/users/admins/manageDoctor.ejs", {
        user: req.user,
        doctors: doctors,
    });
};

let getManageClinic = async (req, res) => {
    let clinics = await homeService.getClinics();
    return res.render("main/users/admins/manageClinic.ejs", {
        user: req.user,
        clinics: clinics
    });
};

let getCreateDoctor = async (req, res) => {
    let clinics = await homeService.getClinics();
    let specializations = await homeService.getSpecializations();
    return res.render("main/users/admins/createDoctor.ejs", {
        user: req.user,
        clinics: clinics,
        specializations: specializations
    });
};
let postCreateDoctor = async (req, res) => {
    let doctor = {
        'name': req.body.name,
        'phone': req.body.phone,
        'email': req.body.email,
        'password': req.body.password,
        'clinicId': req.body.clinic,
        'specializationId': req.body.specialization,
        'address': req.body.address,
        'avatar': 'doctor.jpg',
        'description': req.body.description
    };
    try {
        await userService.createDoctor(doctor);
        return res.status(200).json({ message: 'success' })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err })
    }
};

let getCreateClinic = (req, res) => {
    return res.render("main/users/admins/createClinic.ejs", {
        user: req.user
    });
};


let postCreateClinic = (req, res) => {
    imageClinicUploadFile(req, res, async (err) => {
        if (err) {
            console.log(err);
            if (err.message) {
                console.log(err.message);
                return res.status(500).send(err.message);
            } else {
                console.log(err);
                return res.status(500).send(err);
            }
        }

        try {
            let item = req.body;
            let imageClinic = req.file;
            item.image = imageClinic.filename;
            let clinic = await clinicService.createNewClinic(item);
            return res.status(200).json({
                message: 'success',
                clinic: clinic
            });

        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    });
};

let storageImageClinic = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/clinics");
    },
    filename: (req, file, callback) => {
        let imageName = `${Date.now()}-${file.originalname}`;
        callback(null, imageName);
    }
});

let imageClinicUploadFile = multer({
    storage: storageImageClinic,
    limits: { fileSize: 1048576 * 20 }
}).single("image");

let postCreateClinicWithoutFile = async (req, res) => {
    try {
        let clinic = await clinicService.createNewClinic(req.body);
        return res.status(200).json({
            message: 'success',
            clinic: clinic
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let deleteClinicById = async (req, res) => {
    try {
        let clinic = await clinicService.deleteClinicById(req.body.id);
        return res.status(200).json({
            'message': 'success'
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getEditClinic = async (req, res) => {
    let clinic = await clinicService.getClinicById(req.params.id);
    return res.render("main/users/admins/editClinic.ejs", {
        user: req.user,
        clinic: clinic
    });
};

let putUpdateClinicWithoutFile = async (req, res) => {
    try {
        let clinic = await clinicService.updateClinic(req.body);
        return res.status(200).json({
            message: 'update success',
            clinic: clinic
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let putUpdateClinic = (req, res) => {
    imageClinicUploadFile(req, res, async (err) => {
        if (err) {
            console.log(err);
            if (err.message) {
                console.log(err.message);
                return res.status(500).send(err.message);
            } else {
                console.log(err);
                return res.status(500).send(err);
            }
        }

        try {
            let item = req.body;
            let imageClinic = req.file;
            item.image = imageClinic.filename;
            let clinic = await clinicService.updateClinic(item);
            return res.status(200).json({
                message: 'update clinic successful',
                clinic: clinic
            });

        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    });
};

let getSpecializationPage = async (req, res) => {
    try {
        let specializations = await specializationService.getAllSpecializations();
        return res.render("main/users/admins/manageSpecialization.ejs", {
            user: req.user,
            specializations: specializations
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let deleteDoctorById = async (req, res) => {
    try {
        let doctor = await doctorService.deleteDoctorById(req.body.id);
        return res.status(200).json({
            'message': 'success'
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getEditDoctor = async (req, res) => {
    let doctor = await doctorService.getDoctorForEditPage(req.params.id);
    let clinics = await homeService.getClinics();
    let specializations = await homeService.getSpecializations();
    return res.render("main/users/admins/editDoctor.ejs", {
        user: req.user,
        doctor: doctor,
        clinics: clinics,
        specializations: specializations
    })
};

let putUpdateDoctorWithoutFile = async (req, res) => {
    try {
        let item = {
            id: req.body.id,
            name: req.body.nameDoctor,
            phone: req.body.phoneDoctor,
            address: req.body.addressDoctor,
            description: req.body.introEditDoctor,
            clinicId: req.body.clinicDoctor,
            specializationId: req.body.specializationDoctor
        };
        await doctorService.updateDoctorInfo(item);
        return res.status(200).json({
            message: 'update info doctor successful'
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json(e);
    }
};

let putUpdateDoctor = (req, res) => {
    imageDoctorUploadFile(req, res, async (err) => {
        if (err) {
            if (err.message) {
                return res.status(500).send(err.message);
            } else {
                return res.status(500).send(err);
            }
        }

        try {
            console.log('req.file:', req.file);
            
            let item = {
                id: req.body.id,
                name: req.body.nameDoctor,
                phone: req.body.phoneDoctor,
                address: req.body.addressDoctor,
                description: req.body.introEditDoctor,
                clinicId: req.body.clinicDoctor,
                specializationId: req.body.specializationDoctor
            };
            let imageDoctor = req.file;
            item.avatar = imageDoctor.filename;
            let doctor = await doctorService.updateDoctorInfo(item);
            return res.status(200).json({
                message: 'update doctor info successful',
                doctor: doctor
            });

        } catch (e) {
            return res.status(500).send(e);
        }
    });
};

let storageImageDoctor = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/users");
    },
    filename: (req, file, callback) => {
        let imageName = `${Date.now()}-${file.originalname}`;
        callback(null, imageName);
    }
});

let imageDoctorUploadFile = multer({
    storage: storageImageDoctor,
    limits: { fileSize: 1048576 * 20 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(file.originalname.toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép các file ảnh (jpeg, jpg, png)'));
        }
    }
}).single("avatar");

let getSupporterPage = async (req, res) => {
    let supporters = await supporterService.getAllSupporters();
    return res.render("main/users/admins/manageSupporter.ejs", {
        user: req.user,
        supporters: supporters
    })
};

let deleteSpecializationById = async (req, res) => {
    try {
        await specializationService.deleteSpecializationById(req.body.id);
        return res.status(200).json({
            message: 'delete specialization successful'
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }

};

let deletePostById = async (req, res) => {
    try {
        await supporterService.deletePostById(req.body.id);
        return res.status(200).json({
            message: 'delete post successful'
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getEditPost = async (req, res) => {
    try {
        let clinics = await homeService.getClinics();
        let doctors = await userService.getInfoDoctors();
        let specializations = await homeService.getSpecializations();
        let post = await supporterService.getDetailPostPage(req.params.id);
        return res.render('main/users/admins/editPost.ejs', {
            clinics: clinics,
            doctors: doctors,
            specializations: specializations,
            user: req.user,
            post: post
        });

    } catch (e) {
        console.log(e);
    }
};

let putUpdatePost = async (req, res) => {
    try {
        let data = {
            id: req.body.id,
            title: req.body.titlePost,
            forDoctorId: req.body.forDoctorId,
            forClinicId: req.body.forClinicId,
            forSpecializationId: req.body.forSpecializationId,
            writerId: req.user.id,
            contentMarkdown: req.body.contentMarkdown,
            contentHTML: req.body.contentHTML,
            updatedAt: Date.now()
        };

        await supporterService.putUpdatePost(data);
        return res.status(200).json({
            message: 'update post successful'
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getManageCreateScheduleForDoctorsPage = async (req, res) => {
    try {
        return res.render('main/users/admins/manageScheduleForDoctors.ejs', {
            user: req.user,
        })
    } catch (e) {
        console.log(e);
    }

};

let getInfoStatistical = async (req, res) => {
    try {
        let month = req.body.month;
        let object = await userService.getInfoStatistical(month);
        return res.status(200).json(object);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

// Thêm các phương thức này vào adminController.js

// Sửa lại hàm getSpecializationById
let getSpecializationById = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(200).json({
                errCode: 1,
                errMessage: 'Thiếu thông tin ID chuyên khoa'
            });
        }
        
        const id = parseInt(req.body.id);
        let specialization = await db.Specialization.findOne({
            where: { id: id },
            raw: true
        });
        
        if (!specialization) {
            return res.status(200).json({
                errCode: 2,
                errMessage: 'Không tìm thấy chuyên khoa'
            });
        }
        
        return res.status(200).json({
            errCode: 0,
            data: specialization
        });
    } catch (e) {
        console.log("Error in getSpecializationById:", e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ server'
        });
    }
};

// Hiển thị trang chỉnh sửa chuyên khoa
let getEditSpecializationPage = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).send('ID không hợp lệ');
        }
        
        console.log("Fetching specialization with ID:", id);
        
        let specialization = await specializationService.getSpecializationById(id);
        console.log("Found specialization:", specialization);
        
        if (!specialization) {
            return res.status(404).send("Không tìm thấy chuyên khoa");
        }
        
        return res.render("main/users/admins/editSpecialization.ejs", {
            user: req.user,
            specialization: specialization
            // Không cần truyền places nữa vì không lấy dữ liệu places
        });
    } catch (e) {
        console.log("Error in getEditSpecializationPage:", e);
        return res.status(500).json({ error: e.message });
    }
};

// Cập nhật thông tin chuyên khoa
let putUpdateSpecialization = async (req, res) => {
    try {
        console.log("Raw request body:", req.body);
        
        // Chuyển đổi ID từ chuỗi sang số
        let specializationId = req.body.id;
        
        // ID là chuỗi rỗng hoặc không tồn tại
        if (!specializationId || specializationId === '') {
            console.log("ID is missing or empty in request body:", req.body);
            return res.status(400).json({
                errCode: 2,
                errMessage: 'Thiếu thông tin ID chuyên khoa'
            });
        }
        
        // Parse ID thành số
        specializationId = parseInt(specializationId);
        if (isNaN(specializationId) || specializationId <= 0) {
            return res.status(400).json({
                errCode: 3,
                errMessage: 'ID chuyên khoa không hợp lệ'
            });
        }
        
        // Cập nhật lại ID trong req.body
        req.body.id = specializationId;
        
        console.log("Updating specialization with ID:", specializationId);
        
        let result = await specializationService.updateSpecialization(req.body);
        return res.status(200).json({
            errCode: 0,
            message: 'Cập nhật chuyên khoa thành công'
        });
    } catch (e) {
        console.log("Error in putUpdateSpecialization:", e);
        return res.status(500).json({
            errCode: 1,
            errMessage: 'Lỗi server: ' + e.message
        });
    }
};

// Xóa chuyên khoa theo ID
let deleteSpecialization = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(200).json({
                errCode: 1,
                errMessage: 'Thiếu thông tin ID chuyên khoa'
            });
        }
        
        const id = parseInt(req.body.id);
        let specialization = await db.Specialization.findOne({
            where: { id: id }
        });
        
        if (!specialization) {
            return res.status(200).json({
                errCode: 2,
                errMessage: 'Không tìm thấy chuyên khoa'
            });
        }
        
        // Xóa chuyên khoa
        await specialization.destroy();
        
        return res.status(200).json({
            errCode: 0,
            message: 'Xóa chuyên khoa thành công'
        });
    } catch (e) {
        console.log("Error in deleteSpecialization:", e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ server'
        });
    }
};

// Lấy thông tin chi tiết tư vấn viên
let getSupporterById = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(200).json({
                errCode: 1,
                errMessage: 'Thiếu thông tin ID tư vấn viên'
            });
        }
        
        const id = parseInt(req.body.id);
        let supporter = await db.User.findOne({
            where: { 
                id: id,
                roleId: 3 // Đảm bảo đây là tư vấn viên
            },
            attributes: {
                exclude: ['password']
            },
            raw: true
        });
        
        if (!supporter) {
            return res.status(200).json({
                errCode: 2,
                errMessage: 'Không tìm thấy tư vấn viên'
            });
        }
        
        return res.status(200).json({
            errCode: 0,
            data: supporter
        });
    } catch (e) {
        console.log("Error in getSupporterById:", e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ server'
        });
    }
};

// Hiển thị trang chỉnh sửa tư vấn viên
let getEditSupporterPage = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).send('ID không hợp lệ');
        }
        
        let supporter = await db.User.findOne({
            where: { 
                id: id,
                roleId: 3 // Đảm bảo đây là tư vấn viên
            },
            attributes: {
                exclude: ['password']
            },
            raw: true
        });
        
        if (!supporter) {
            return res.status(404).send("Không tìm thấy tư vấn viên");
        }
        
        return res.render("main/users/admins/editSupporter.ejs", {
            user: req.user,
            supporter: supporter
        });
    } catch (e) {
        console.log("Error in getEditSupporterPage:", e);
        return res.status(500).json({ error: e.message });
    }
};

// Cập nhật thông tin tư vấn viên
let putUpdateSupporter = async (req, res) => {
    try {
        const supporterId = parseInt(req.body.id);
        if (isNaN(supporterId) || supporterId <= 0) {
            return res.status(400).json({
                errCode: 3,
                errMessage: 'ID tư vấn viên không hợp lệ'
            });
        }
        
        let supporter = await db.User.findOne({
            where: { 
                id: supporterId,
                roleId: 3
            }
        });
        
        if (!supporter) {
            return res.status(404).json({
                errCode: 2,
                errMessage: 'Không tìm thấy tư vấn viên'
            });
        }
        
        // Cập nhật thông tin
        await supporter.update({
            name: req.body.name || supporter.name,
            email: req.body.email || supporter.email,
            phone: req.body.phone || supporter.phone,
            address: req.body.address || supporter.address,
            description: req.body.description || supporter.description,
            isActive: req.body.isActive !== undefined ? req.body.isActive : supporter.isActive
        });
        
        return res.status(200).json({
            errCode: 0,
            message: 'Cập nhật tư vấn viên thành công'
        });
    } catch (e) {
        console.log("Error in putUpdateSupporter:", e);
        return res.status(500).json({
            errCode: 1,
            errMessage: 'Lỗi server: ' + e.message
        });
    }
};

// Xóa tư vấn viên
let deleteSupporter = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(200).json({
                errCode: 1,
                errMessage: 'Thiếu thông tin ID tư vấn viên'
            });
        }
        
        const id = parseInt(req.body.id);
        let supporter = await db.User.findOne({
            where: { 
                id: id,
                roleId: 3
            }
        });
        
        if (!supporter) {
            return res.status(200).json({
                errCode: 2,
                errMessage: 'Không tìm thấy tư vấn viên'
            });
        }
        
        // Xóa tư vấn viên (hoặc đánh dấu xóa)
        // Tùy vào thiết kế hệ thống, có thể xóa hoàn toàn hoặc đánh dấu là đã xóa
        await supporter.destroy(); // Nếu hệ thống có paranoid, sẽ chỉ cập nhật deletedAt
        
        return res.status(200).json({
            errCode: 0,
            message: 'Xóa tư vấn viên thành công'
        });
    } catch (e) {
        console.log("Error in deleteSupporter:", e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ server'
        });
    }
};

// Sửa lại hàm handleBulkCreateSchedule
let handleBulkCreateSchedule = async (req, res) => {
    try {
        console.log("Starting bulk schedule creation process");
        
        // Thiết lập các ngày (3 ngày tới)
        const today = new Date();
        const dates = [];
        
        for (let i = 0; i < 3; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            
            // Format: DD/MM/YYYY
            const day = String(nextDay.getDate()).padStart(2, '0');
            const month = String(nextDay.getMonth() + 1).padStart(2, '0');
            const year = nextDay.getFullYear();
            dates.push(`${day}/${month}/${year}`);
        }
        
        console.log("Creating schedules for dates:", dates);
        
        // Khung giờ mặc định
        const timeSlots = [
            '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
            '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00'
        ];
        
        // Lấy danh sách bác sĩ từ bảng Users
        try {
            // Thay đổi cách truy vấn để lấy chính xác mảng các user có roleId = 2
            const doctors = await db.User.findAll({
                where: {
                    roleId: 2,
                    isActive: 1,
                    deletedAt: null
                },
                attributes: ['id'],
                raw: true
            });
            
            // Kiểm tra và log kết quả truy vấn
            console.log("Query result:", doctors);
            
            if (!doctors || doctors.length === 0) {
                return res.status(200).json({
                    errCode: 1,
                    errMessage: 'Không tìm thấy bác sĩ nào trong hệ thống'
                });
            }
            
            // Lấy mảng chỉ chứa các ID của bác sĩ
            const doctorIds = doctors.map(doctor => doctor.id);
            console.log("Doctor IDs extracted from database:", doctorIds);
            
            // Khởi tạo biến đếm
            let successCount = 0;
            let errorCount = 0;
            
            // Xử lý từng bác sĩ
            for (const doctorId of doctorIds) {
                console.log(`Processing doctor ID: ${doctorId}`);
                
                // Xử lý từng ngày
                for (const date of dates) {
                    try {
                        console.log(`Creating schedule for doctor ${doctorId} on ${date}`);
                        
                        // Tạo lịch cho bác sĩ
                        const result = await doctorService.bulkCreateSchedule({
                            doctorId: doctorId,
                            date: date,
                            timeArr: timeSlots
                        });
                        
                        if (result.errCode === 0) {
                            successCount += (result.data?.length || 0);
                            console.log(`Successfully created schedules for doctor ${doctorId} on ${date}`);
                        } else {
                            console.log(`Failed to create schedules for doctor ${doctorId} on ${date}: ${result.errMessage}`);
                        }
                    } catch (err) {
                        errorCount++;
                        console.error(`Error creating schedule for doctor ${doctorId} on ${date}:`, err);
                    }
                }
            }
            
            return res.status(200).json({
                errCode: 0,
                errMessage: `Đã tạo thành công ${successCount} lịch khám cho các bác sĩ`,
                data: {
                    successCount,
                    errorCount,
                    doctorCount: doctorIds.length
                }
            });
        } catch (dbError) {
            console.error("Database error:", dbError);
            return res.status(500).json({
                errCode: -1,
                errMessage: 'Lỗi truy vấn database: ' + dbError.message
            });
        }
    } catch (e) {
        console.error("Error in handleBulkCreateSchedule:", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi server: ' + e.message
        });
    }
};

// Thêm vào adminController.js
let getSchedulesList = async (req, res) => {
    try {
        // Lấy filter từ query params
        const { doctorId, date } = req.query;
        
        // Xây dựng điều kiện tìm kiếm
        let condition = {};
        if (doctorId) condition.doctorId = doctorId;
        if (date) condition.date = date;
        
        // Sửa lỗi - không sử dụng destructuring
        const schedules = await db.sequelize.query(
            `SELECT s.*, u.id as userId, u.name as doctorName, u.email as doctorEmail 
             FROM Schedules s 
             LEFT JOIN Users u ON s.doctorId = u.id 
             WHERE ${doctorId ? 's.doctorId = :doctorId AND ' : ''} 
                   ${date ? 's.date = :date AND ' : ''} 
                   1=1 
             ORDER BY s.date ASC, s.time ASC`,
            {
                replacements: { doctorId, date },
                type: db.sequelize.QueryTypes.SELECT,
                raw: true
            }
        );
        
        console.log("Schedules data type:", typeof schedules, Array.isArray(schedules));
        
        // Format lại kết quả để frontend dễ xử lý
        const formattedSchedules = Array.isArray(schedules) ? schedules.map(schedule => ({
            id: schedule.id,
            doctorId: schedule.doctorId,
            date: schedule.date,
            time: schedule.time,
            maxBooking: schedule.maxBooking,
            sumBooking: schedule.sumBooking,
            doctorData: {
                id: schedule.userId,
                name: schedule.doctorName,
                email: schedule.doctorEmail
            }
        })) : [];
        
        return res.status(200).json({
            errCode: 0,
            errMessage: 'Lấy danh sách lịch khám thành công',
            data: formattedSchedules
        });
    } catch (e) {
        console.error("Error in getSchedulesList:", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi server: ' + e.message
        });
    }
};

// API để lấy tất cả doctors
let getAllDoctors = async (req, res) => {
    try {
        // Sử dụng raw query để lấy đúng cấu trúc dữ liệu từ bảng Users
        const [doctors] = await db.sequelize.query(
            `SELECT id, name, email 
             FROM Users 
             WHERE roleId = 2 
             AND deletedAt IS NULL 
             AND isActive = 1`,
            {
                type: db.sequelize.QueryTypes.SELECT,
                raw: true
            }
        );
        
        return res.status(200).json({
            errCode: 0,
            errMessage: 'OK',
            data: doctors
        });
    } catch (e) {
        console.error("Error in getAllDoctors:", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi server: ' + e.message
        });
    }
};

module.exports = {
    getManageDoctor: getManageDoctor,
    getCreateDoctor: getCreateDoctor,
    getEditClinic: getEditClinic,
    getManageClinic: getManageClinic,
    getCreateClinic: getCreateClinic,
    getSpecializationPage: getSpecializationPage,
    getEditDoctor: getEditDoctor,
    getSupporterPage: getSupporterPage,
    getEditPost: getEditPost,
    getManageCreateScheduleForDoctorsPage: getManageCreateScheduleForDoctorsPage,
    getInfoStatistical: getInfoStatistical,

    postCreateDoctor: postCreateDoctor,
    postCreateClinic: postCreateClinic,
    postCreateClinicWithoutFile: postCreateClinicWithoutFile,

    putUpdateClinicWithoutFile: putUpdateClinicWithoutFile,
    putUpdateClinic: putUpdateClinic,
    putUpdateDoctorWithoutFile: putUpdateDoctorWithoutFile,
    putUpdateDoctor: putUpdateDoctor,
    putUpdatePost: putUpdatePost,

    deleteClinicById: deleteClinicById,
    deleteDoctorById: deleteDoctorById,
    deleteSpecializationById: deleteSpecializationById,
    deletePostById: deletePostById,

    getSpecializationById: getSpecializationById,
    getEditSpecializationPage: getEditSpecializationPage,
    putUpdateSpecialization: putUpdateSpecialization,
    deleteSpecialization: deleteSpecialization,

    getSupporterById: getSupporterById,
    getEditSupporterPage: getEditSupporterPage,
    putUpdateSupporter: putUpdateSupporter,
    deleteSupporter: deleteSupporter,

    handleBulkCreateSchedule: handleBulkCreateSchedule,
    getSchedulesList: getSchedulesList,
    getAllDoctors: getAllDoctors
};
