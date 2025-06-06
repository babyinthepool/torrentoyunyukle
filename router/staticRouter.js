const express=require("express")
const router=express.Router()
const game = {
    name: "Oyunları necə yükləyək?"
}

router.get('/nece-yukleyek',(req,res)=>{
    res.render('static/neceYukleyek', {
        game: game})
})



module.exports=router