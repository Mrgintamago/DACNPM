import db from "./../models";

let getSpecializationById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let specialization = await db.Specialization.findOne({
                where: { id: id },
                raw: true // Lấy dữ liệu dạng plain object
            });
            
            if (!specialization) {
                reject(`Không tìm thấy chuyên khoa với id = ${id}`);
                return;
            }
            
            // Bỏ đoạn code liên quan đến Places
            // KHÔNG gọi Places.findAll() ở đây nữa
            
            resolve(specialization);
        } catch (e) {
            reject(e);
        }
    });
};

let getAllSpecializations = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let listSpecializations = await db.Specialization.findAll({
                attributes: [ 'id', 'name' ],
                order: [
                    [ 'name', 'ASC' ]
                ],
            });
            resolve(listSpecializations);
        } catch (e) {
            reject(e);
        }
    });
};

let deleteSpecializationById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.Specialization.destroy({
                where: { id: id }
            });
            let infos = await db.Doctor_User.findAll({
                where: {
                    specializationId: id
                }
            });
            let arrId = [];
            infos.forEach((x) => {
                arrId.push(x.id);
            });
            await db.Doctor_User.destroy({ where: { id: arrId } });
            resolve(true);

        } catch (e) {
            reject(e);
        }
    });
};

let updateSpecialization = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm validation cho ID
            if (!data.id) {
                reject(new Error('ID chuyên khoa không được để trống'));
                return;
            }
            
            console.log("Finding specialization with ID:", data.id);
            
            let specialization = await db.Specialization.findOne({
                where: { id: data.id }
            });
            
            if (!specialization) {
                reject(new Error(`Không tìm thấy chuyên khoa với id = ${data.id}`));
                return;
            }
            
            // Cập nhật thông tin
            await specialization.update({
                name: data.name || specialization.name,
                description: data.description || specialization.description,
                ...(data.image && { image: data.image }),
                updatedAt: new Date()
            });
            
            // Quan trọng: Nhớ resolve kết quả
            resolve(specialization);
        } catch (e) {
            console.error("Error in updateSpecialization:", e);
            reject(e);
        }
    });
};

module.exports = {
    getSpecializationById: getSpecializationById,
    getAllSpecializations: getAllSpecializations,
    deleteSpecializationById: deleteSpecializationById,
    updateSpecialization: updateSpecialization
};
