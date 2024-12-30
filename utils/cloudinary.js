const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("No file path provided");
            return null;
        }

        console.log("Uploading file to Cloudinary:", localFilePath);

        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log("File uploaded to Cloudinary successfully:", result.url);
        return result;
    } catch (error) {
        console.error("Error during Cloudinary upload:", error);
        if (fs.existsSync(localFilePath)) {
            console.log("Deleting temporary local file:", localFilePath);
            fs.unlinkSync(localFilePath);
        }
        throw error;
    }
};


// Export both cloudinary and uploadOnCloudinary explicitly
module.exports = {
    cloudinary,
    uploadOnCloudinary,
};
