import express from "express";
import home from "./../controllers/homeController";
import auth from "./../controllers/authController";
import admin from "./../controllers/adminController";
import doctor from "./../controllers/doctorController";
import supporter from "./../controllers/supporterController";
import clinic from "./../controllers/clinicController";
import passport from "passport";
import passportLocal from 'passport-local';
import userService from "./../services/userService";
const packageController = require('../controllers/packageController');
import userController from '../controllers/userController';
import authController from "../controllers/authController";
import doctorController from "../controllers/doctorController";
// Hoặc sử dụng
// const authController = require('../controllers/authController');

const multer = require('multer');
const upload = multer();

let router = express.Router();

let LocalStrategy = passportLocal.Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    async (req, email, password, done) => {
        try {
            await userService.findUserByEmail(email).then(async (user) => {
                if (!user) {
                    return done(null, false, req.flash("error", "Email không tồn tại"));
                }
                if (user && user.isActive === 1) {
                    let match = await userService.comparePassword(password, user);
                    if (match) {
                        return done(null, user, null)
                    } else {
                        return done(null, false, req.flash("error", "Mật khẩu không chính xác")
                        )
                    }
                }
                if (user && user.isActive === 0) {
                    return done(null, false, req.flash("error", "Tài khoản chưa được kích hoạt"));
                }
            });
        } catch (err) {
            console.log(err);
            return done(null, false, { message: err });
        }
    }));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    userService.findUserById(id).then((user) => {
        return done(null, user);
    }).catch(error => {
        return done(error, null)
    });
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện chức năng này' });
};

// Thêm middleware multer để xử lý form multipart/form-data
let storageSpecialization = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/specializations");
    },
    filename: (req, file, callback) => {
        let imageName = `${Date.now()}-${file.originalname}`;
        callback(null, imageName);
    }
});

let uploadSpecializationImage = multer({
    storage: storageSpecialization
}).single("image");

let initRoutes = (app) => {
    router.get("/all-clinics", home.getPageAllClinics);
    router.get("/all-doctors", home.getPageAllDoctors);
    router.get("/all-specializations", home.getPageAllSpecializations);
    router.get('/all-packages', packageController.getAllPackages);

    router.get('/feedback/:id', home.getFeedbackPage);
    router.post('/feedback/create', home.postCreateFeedback);

    router.get('/for-patients', home.getPageForPatients);
    router.get('/for-doctors', home.getPageForDoctors);

    router.post('/search-homepage', home.postSearchHomePage);

    router.get('/', home.getHomePage);
    router.get('/contact', home.getContactPage);

    router.get('/detail/doctor/:id', home.getDetailDoctorPage);

    router.post('/booking-doctor-without-files/create', home.postBookingDoctorPageWithoutFiles);
    router.post('/booking-doctor-normal/create', home.postBookingDoctorPageNormal);

    router.get('/detail/post/:id', home.getDetailPostPage);
    router.get('/handbook/search', home.getPostSearch);
    router.get('/posts/search', (req, res) => {
        const query = req.query.keyword || '';
        res.redirect(`/handbook/search?q=${encodeURIComponent(query)}`);
    });
    router.get('/handbook/:id', home.getDetailHandbook); //
    router.get('/supporter/pagination/handbooks', home.getHandbookPaginationAPI);; //

    router.get('/detail/clinic/:id', home.getDetailClinicPage);
    router.get('/booking-info/:id', home.getInfoBookingPage);

    router.get('/all-posts', home.getPostsWithPagination);
    router.get('/all-handbook', home.getHandbookWithPagination); //
    router.get('/posts/search/', home.getPostSearch);

    router.get('/users/manage/specialization', auth.checkLoggedIn, admin.getSpecializationPage);
    router.get('/users/manage/supporter', auth.checkLoggedIn, admin.getSupporterPage);
    router.get('/users', auth.checkLoggedIn, home.getUserPage);

    router.get('/users/manage/schedule-for-doctors', auth.checkLoggedIn, admin.getManageCreateScheduleForDoctorsPage);

    router.get('/users/manage/doctor', auth.checkLoggedIn, admin.getManageDoctor);
    router.get('/users/manage/doctor/create', auth.checkLoggedIn, admin.getCreateDoctor);
    router.post('/admin/doctor/create', auth.checkLoggedIn, admin.postCreateDoctor);
    router.get('/users/doctor/edit/:id', auth.checkLoggedIn, admin.getEditDoctor);
    router.put('/admin/doctor/update-without-file', auth.checkLoggedIn, admin.putUpdateDoctorWithoutFile);
    router.put('/admin/doctor/update', auth.checkLoggedIn, admin.putUpdateDoctor);

    router.get('/users/manage/clinic', auth.checkLoggedIn, admin.getManageClinic);
    router.get('/users/manage/clinic/create', auth.checkLoggedIn, admin.getCreateClinic);
    router.post('/admin/clinic/create', auth.checkLoggedIn, admin.postCreateClinic);
    router.post('/admin/clinic/create-without-file', auth.checkLoggedIn, admin.postCreateClinicWithoutFile);

    router.put('/admin/clinic/update-without-file', auth.checkLoggedIn, admin.putUpdateClinicWithoutFile);
    router.put('/admin/clinic/update', auth.checkLoggedIn, admin.putUpdateClinic);
    router.get('/users/clinic/edit/:id', auth.checkLoggedIn, admin.getEditClinic);

    router.get('/doctor/manage/schedule', doctor.getSchedule);
    router.get('/doctor/manage/schedule/create', auth.checkLoggedIn, doctor.getCreateSchedule);
    router.post('/doctor/manage/schedule/create', auth.checkLoggedIn, doctor.postCreateSchedule);
    router.post('/doctor/get-schedule-doctor-by-date', doctor.getScheduleDoctorByDate);
    router.get('/doctor/manage/appointment', auth.checkLoggedIn, doctor.getManageAppointment);
    router.get('/doctor/manage/chart', auth.checkLoggedIn, doctor.getManageChart);
    router.post('/doctor/manage/create-chart', auth.checkLoggedIn, doctor.postCreateChart);
    router.post('/doctor/send-forms-to-patient', auth.checkLoggedIn, doctor.postSendFormsToPatient);
    router.post('/doctor/auto-create-all-doctors-schedule', (req, res, next) => {
        // Middleware kiểm tra trước khi xử lý
        if (req.user && req.user.roleId !== 1) {
            return res.status(403).send('Chỉ admin mới có thể thực hiện chức năng này');
        }
        next();
    }, doctorController.autoCreateAllDoctorsSchedule);

    router.get('/supporter/manage/customers', auth.checkLoggedIn, supporter.getManageCustomersPage);
    router.get('/supporter/get-new-patients', auth.checkLoggedIn, supporter.getNewPatients);
    router.get('/supporter/manage/posts', auth.checkLoggedIn, supporter.getManagePosts);
    router.get('/supporter/pagination/posts', supporter.getPostsPagination);
    router.get('/supporter/post/edit/:id', auth.checkLoggedIn, admin.getEditPost);
    router.put('/supporter/post/update', auth.checkLoggedIn, admin.putUpdatePost);
    router.get('/supporter/manage/post/create', auth.checkLoggedIn, supporter.getCreatePost);
    router.post('/supporter/manage/post/create', auth.checkLoggedIn, supporter.postCreatePost);
    router.get('/supporter/get-list-posts', auth.checkLoggedIn, supporter.getAllPosts);
    router.post('/supporter/get-patients-for-tabs', auth.checkLoggedIn, supporter.getForPatientsTabs);
    router.post('/supporter/change-status-patient', auth.checkLoggedIn, supporter.postChangeStatusPatient);
    router.post('/supporter/get-logs-patient', auth.checkLoggedIn, supporter.getLogsPatient);
    router.post('/supporter/done-comment', auth.checkLoggedIn, supporter.postDoneComment);

    router.post('/api/get-info-doctor-by-id', doctor.getInfoDoctorById);
    router.post('/api/get-info-clinic-by-id', clinic.getInfoClinicById);
    router.post('/api/get-detail-patient-by-id', home.getDetailPatientBooking);

    router.delete('/admin/delete/clinic', auth.checkLoggedIn, admin.deleteClinicById);
    router.delete('/admin/delete/doctor', auth.checkLoggedIn, admin.deleteDoctorById);
    router.delete('/admin/delete/specialization', auth.checkLoggedIn, admin.deleteSpecializationById);
    router.delete('/admin/delete/post', auth.checkLoggedIn, admin.deletePostById);
    router.delete('/admin/delete/comment', auth.checkLoggedIn, admin.deleteCommentById);

    router.get("/login", auth.checkLoggedOut, auth.getLogin);

    router.post('/login', function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }
            // Redirect if it fails
            if (!user) {
                return res.redirect('/login');
            }

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }

                req.session.save(() => {
                    // Redirect if it succeeds
                    return res.redirect('/users');
                });

            });
        })(req, res, next);
    });

    router.get('/register', auth.getRegister);
    router.post("/register", auth.postRegister);
    // router.get("/verify/:token", auth.verifyAccount);

    router.get("/logout", auth.checkLoggedIn, auth.getLogout);

    router.post("/admin/statistical", auth.checkLoggedIn, admin.getInfoStatistical);

    router.get('/detail/package/:id', packageController.getPackageDetailById);

    router.post('/user/change-password', isAuthenticated, userController.changePassword);
    router.post('/user/update-info', isAuthenticated, userController.updateUserInfo);

    // Thêm route API quên mật khẩu
    router.post('/api/forgot-password', authController.handleForgotPassword);

    router.get('/reset-password/:token', authController.getResetPasswordPage);
    router.post('/reset-password/:token', authController.handleResetPassword);

    router.get('/api/get-doctors', doctorController.getDoctorsForSchedule);
    // Tìm dòng này
    router.post('/doctor/create-schedule', doctorController.createSchedule);

    // Nếu có bất kỳ middleware nào đang được áp dụng, hãy kiểm tra chúng
    // Ví dụ:
    // router.post('/doctor/create-schedule', someMiddleware, doctorController.createSchedule);

    // Thêm các route này vào file web.js

    // Route để lấy thông tin chuyên khoa theo ID
    router.post('/admin/get-specialization-by-id', auth.checkLoggedIn, admin.getSpecializationById);

    // Route để hiển thị trang chỉnh sửa chuyên khoa
    router.get('/admin/edit-specialization/:id', auth.checkLoggedIn, admin.getEditSpecializationPage);

    // Thay đổi route để xử lý file upload
    router.put('/admin/update-specialization', auth.checkLoggedIn, (req, res, next) => {
        uploadSpecializationImage(req, res, (err) => {
            if (err) {
                return res.status(500).json({
                    errCode: 3,
                    errMessage: `Lỗi upload file: ${err.message}`
                });
            }

            // Thêm đường dẫn file vào req.body nếu có file upload
            if (req.file) {
                req.body.image = req.file.filename;
            }

            // Log dữ liệu sau khi xử lý file
            console.log("Request body after upload:", req.body);

            next();
        });
    }, admin.putUpdateSpecialization);

    // Thêm route cho trang quản lý chuyên khoa
    router.get('/admin/manage-specialization', auth.checkLoggedIn, admin.getSpecializationPage);

    // Thêm routes cho xem chi tiết và xóa chuyên khoa
    router.post('/admin/get-specialization-by-id', auth.checkLoggedIn, admin.getSpecializationById);
    router.delete('/admin/delete-specialization', auth.checkLoggedIn, admin.deleteSpecialization);

    // Thêm các route cho tư vấn viên
    router.get('/users/supporter/edit/:id', auth.checkLoggedIn, admin.getEditSupporterPage);
    router.put('/admin/supporter/update', auth.checkLoggedIn, admin.putUpdateSupporter);
    router.post('/admin/get-supporter-by-id', auth.checkLoggedIn, admin.getSupporterById);
    router.delete('/admin/delete-supporter', auth.checkLoggedIn, admin.deleteSupporter);

    // Route cho trang chi tiết chuyên khoa
    router.get('/detail/specialization/:id', home.getSpecialization);

    // Kiểm tra route API bulk-create-schedule đã tồn tại
    router.post('/api/bulk-create-schedule', admin.handleBulkCreateSchedule);

    // Thêm route API để lấy danh sách lịch khám
    router.get('/api/get-schedules', auth.checkLoggedIn, admin.getSchedulesList);

    // API để lấy tất cả bác sĩ
    router.get('/api/get-all-doctors', admin.getAllDoctors);

    // API lấy lịch theo nhiều ngày
    router.get('/api/get-schedules-by-days', admin.getSchedulesByDays);

    // Route mới cho trang chi tiết lịch
    router.get('/admin/schedule-detail', auth.checkLoggedIn, admin.getScheduleDetailPage);

    // Thêm hoặc kiểm tra route sau
    router.get('/users/manage/supporter/create', auth.checkLoggedIn, admin.getCreateSupporterPage);

    // Thêm route cho API tạo tư vấn viên
    router.post('/admin/create-supporter', auth.checkLoggedIn, admin.createSupporter);

    // Các routes cho quản lý lịch khám
    router.get('/users/admin/manage-schedule-for-doctors', auth.checkLoggedIn, admin.getManageCreateScheduleForDoctorsPage);
    router.get('/admin/schedule-detail', auth.checkLoggedIn, admin.getScheduleDetailPage);

    // Các routes cho quản lý tư vấn viên
    router.get('/users/manage/supporter', auth.checkLoggedIn, admin.getSupporterPage);
    router.get('/users/manage/supporter/create', auth.checkLoggedIn, admin.getCreateSupporterPage);
    router.get('/users/supporter/edit/:id', auth.checkLoggedIn, admin.getEditSupporterPage);

    // Route POST để tạo tư vấn viên
    router.post('/admin/create-supporter', auth.checkLoggedIn, admin.createSupporter);

    // Route cho trang tạo mới chuyên khoa
    router.get('/admin/manage/specialization/create', auth.checkLoggedIn, admin.getCreateSpecializationPage);

    // Route xử lý POST request khi submit form tạo chuyên khoa
    router.post('/admin/create-specialization', auth.checkLoggedIn, (req, res, next) => {
        uploadSpecializationImage(req, res, (err) => {
            if (err) {
                return res.status(500).json({
                    errCode: 3,
                    errMessage: `Lỗi upload file: ${err.message}`
                });
            }

            // Thêm đường dẫn file vào req.body nếu có file upload
            if (req.file) {
                req.body.image = req.file.filename;
            }

            next();
        });
    }, admin.postCreateSpecialization);

    return app.use("/", router);
};
module.exports = initRoutes;
