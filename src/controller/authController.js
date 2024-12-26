export const googleLoginSuccess = (req, res) => {
    // console.log('req :>> ', req);
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "Authentication successful",
            user: req.user,
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }
};

export const googleLogout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed", error: err });
        }
        res.status(200).json({ message: "Successfully logged out" });
    });
};
