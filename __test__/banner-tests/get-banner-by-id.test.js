const request = require("supertest")
const app = require("../../app")
const {clearBanners} = require("../helpers/clear")
const models = require("../../models")
const {User, Banner} = require("../../models")
const {generateToken} = require("../../helpers/jwt")

let access_token_admin = null
let access_token_customer = null
let bannerTest = null

describe('GET /banners/:id', () => {
    beforeAll((done) => {
        User.findOne({where: {email: 'admin@mail.com'}})
        .then(user => {
            const {id, email, role} = user
            access_token_admin = generateToken({id, email, role})
            return User.findOne({where: {email: 'akira@mail.com'}})
        })
        .then(user => {
            const {id, email, role} = user
            access_token_customer = generateToken({id, email, role})
            const inputBanner = {
                title: 'diskon',
                status: 'active',
                imageUrl: 'test.com'
            }
            return Banner.create(inputBanner)
        })
        .then(banner => {
            bannerTest = banner
            done()
        })
        .catch(err => console.log(err))
    })
    
    afterAll((done) => {
        clearBanners()
        .then(() => {
        models.sequelize.close()
        done()
        })
        .catch(err => console.log(err))
    })

    it('should send response with 200 status code', (done) => {
        request(app)
        .get(`/banners/${bannerTest.id}`)
        .set('access_token', access_token_admin)
        .end((err, res) => {
            if(err) done(err)

            expect(res.statusCode).toEqual(200);
            expect(typeof res.body).toEqual('object');
            expect(res.body).toHaveProperty("id");
            expect(typeof res.body.id).toEqual("number")
            expect(res.body).toHaveProperty("title");
            expect(typeof res.body.title).toEqual("string")
            expect(res.body).toHaveProperty("status");
            expect(typeof res.body.status).toEqual("string")
            expect(res.body).toHaveProperty("imageUrl");
            expect(typeof res.body.imageUrl).toEqual("string")

            done()
        })

    })

    it('should send response with 401 status code when does not have access_token', (done) => {
        request(app)
        .get(`/banners/${bannerTest.id}`)
        .end((err, res) => {
            if(err) done(err)

            expect(res.statusCode).toEqual(401);
            expect(typeof res.body).toEqual('object');
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toEqual('Access Denied! Please login first')
 
            done()
        })

    })

    it('should send response with 401 status code with invalid token', (done) => {
        request(app)
        .get(`/banners/${bannerTest.id}`)
        .set('access_token', access_token_customer)
        .end((err, res) => {
            if(err) done(err)

            expect(res.statusCode).toEqual(401);
            expect(typeof res.body).toEqual('object');
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toEqual('Access Denied! Please login first')
 
            done()
        })

    })


})