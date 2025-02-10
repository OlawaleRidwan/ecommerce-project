import express from 'express'
import jwt,{JwtPayload} from 'jsonwebtoken'


const identifier = (req:express.Request,res:express.Response,next:express.NextFunction) => {
    let token
    if(req.headers.client === 'not-browser') {
         token = req.headers.authorization
    } else {
        token = req.cookies['Authorization']
    }

    if (!token) {
        res.status(403).json({success: false, message: 'Unauthorizaed'});
    }

    try {
        const userToken = token.split(' ')[1]
        console.log({userToken})
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET as string) as JwtPayload & {userId: string, verified: boolean;};
        console.log({jwtVerified})
        if(jwtVerified) {
            req.user = jwtVerified;
            console.log({chUser: req.body})
            next()
        } else {
            throw new Error('error in the token');
        }
    } catch (error) {
        console.log(error); 
    }
}

export default identifier