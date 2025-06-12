const express=require("express")
const router=express.Router()
const game = {
    name: "Oyunları necə yükləyək?"
}

router.get('/nece-yukleyek',(req,res)=>{
    res.render('static/neceYukleyek', {
        game: game})
})


router.get('/discord',(req,res)=>{
    res.render('static/redirectDiscord')
})

module.exports=router