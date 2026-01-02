export const ArtistAPIController = new class {
    uploadPhoto = async function (req, res) {
        res.status(200).json({ message: "Successfully uploaded files" });
    }   
};

export default ArtistAPIController;