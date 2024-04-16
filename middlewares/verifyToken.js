import jwt from "jsonwebtoken"

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Erişim reddedildi. Geçerli bir token sağlanmadı." });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Doğrulanan kullanıcı bilgilerini istek nesnesine ekleme

        // Doğrulama başarılı, bir sonraki middleware'e devam etme
        next();
    } catch (error) {
        // Token geçersiz veya süresi dolmuşsa
        return res.status(401).json({ message: "Geçersiz veya süresi dolmuş token." });
    }
};

export default verifyToken;
