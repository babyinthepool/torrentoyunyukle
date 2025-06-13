const express=require("express")
const router=express.Router()
const {checkAdmin} = require('../middlewares.js')


const Page = require("../models/page.js")
const Game = require("../models/game.js")

const moment = require('moment')
moment.locale('az')

function getYouTubeID(input) {
  // Eğer doğrudan 11 karakterlik video ID'si verilmişse, onu döndür
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) {
    return input;
  }
  
  // Değilse URL içerisinden ID'yi çıkar
  const regex = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = input.match(regex);
  return match ? match[1] : null;
}



const adminHash = process.env.secret


//main
router.get('/',checkAdmin,(req,res)=>{
    res.render('admin/adminIndex')
})

//upload
router.post("/game/update/:gameId",checkAdmin,(req,res)=>{
    var {name, category,gameOutDate,summary,system,cover,gameplayEmbed,images,linkTorrent,linkDirect,linkDirectAlternative,size} = req.body;
    uploadDate = Date.now()
    category = category.split(',')
    images=images.split(',')
const gameplayEmbedId = getYouTubeID(gameplayEmbed)

    const id = req.params.gameId
    Game.findOneAndUpdate({_id:id},{name,uploadDate, category,gameOutDate,summary,system,cover,gameplayEmbed:gameplayEmbedId,images,linkTorrent,linkDirect,linkDirectAlternative,size},{new:true}).lean()
    .then(game=>{
        res.redirect(`/admin/game/update/${id}`)
    })
    .catch(err=>{
        res.send("404")
        console.log(err)
    })
})
router.get('/game/upload',checkAdmin,(req,res)=>{
    res.render('admin/gameUpload')
})
router.get('/game/update',(req,res)=>{
    Game.find().sort({ _id: -1 }).lean().limit(10)
    .then(games=>{
        res.render('admin/gameUpdate',{games})
    })
    .catch(err=>{
        res.send("404")
    })
})

router.get("/game/update/search",checkAdmin,(req,res)=>{
    const search = req.query.oyun
    Game.find({
        $text: { $search: search }
      })
    .limit(10)
    .lean()
    .then(games=>{
        res.render("admin/gameUpdate",{games})
    })
    .catch(err=>{
        res.send("404")
        console.log(err)
    })
})


//upgrade
router.get("/game/upgrade/:gameId",checkAdmin,async (req,res)=>{
    const id = req.params.gameId
    const game = await Game.findById(id).lean()
    if(game){
        res.render("admin/gameUpgrade",{upgrades:game.upgrades, game:game})
    } else {
        res.send("404")
    }
})

router.post("/game/upgrade/add/:gameId",checkAdmin,(req,res)=>{

    const id = req.params.gameId
    const {title, link, summary} = req.body

    Game.findOneAndUpdate(
        {_id: id},
        {$push: {upgrades: {title, link, summary}}},
        {new: true}
    ).lean()
    .then(game=>{
        res.redirect(`/admin/game/upgrade/${id}`)
    })
    .catch(err=>{
        res.send("404")
        console.log(err)
    })

})

router.get("/game/upgrade/:gameId/:upgradeId",checkAdmin, async(req,res)=>{
    const gameId = req.params.gameId
    const upgradeId = req.params.upgradeId

    
const game = await Game.findById(gameId).lean().catch(err => {
  res.send("404 - Game not found");
  return;
});


const upgrade = await game.upgrades.find(upg => upg._id.toString() === upgradeId.toString());

if (upgrade == undefined) {
  res.send("404 - Upgrade not found");
  return;
}

console.log(upgrade)
res.render("admin/gameUpgradeAlone", { game, upgrade });
})


router.get("/game/upgrade/delete/:gameId/:upgradeId",checkAdmin,(req,res)=>{   
    const gameId = req.params.gameId
    const upgradeId = req.params.upgradeId

    Game.findOneAndUpdate(
        {_id: gameId},
        {$pull: {upgrades: {_id: upgradeId}}},
        {new: true}
    ).lean()
    .then(game=>{
        res.redirect(`/admin/game/upgrade/${gameId}`)
    })
    .catch(err=>{
        res.send("404")
        console.log(err)
    })
})

router.post("/game/upgrade/edit/:gameId/:upgradeId",checkAdmin,(req,res)=>{
    const gameId = req.params.gameId
    const upgradeId = req.params.upgradeId
    const {title, link, summary} = req.body

    Game.findOneAndUpdate(
        {_id: gameId, "upgrades._id": upgradeId},
        {$set: {"upgrades.$.title": title, "upgrades.$.link": link, "upgrades.$.summary": summary}},
        {new: true}
    ).lean()
    .then(game=>{
        res.redirect(`/admin/game/upgrade/${gameId}/${upgradeId}`)
    })
    .catch(err=>{
        res.send("404")
        console.log(err)
    })
})
// game upload


router.post('/game/upload',checkAdmin,async (req,res)=>{
    var {name, category,gameOutDate,summary,system,cover,gameplayEmbed,images,linkTorrent,linkDirect,linkDirectAlternative,size} = req.body;
    category = category.split(',')
    function toSlug(str) {
  return str
    .toLowerCase()                 // Küçük harfe çevir
    .trim()                       // Baş ve sondaki boşlukları temizle
    .replace(/\s+/g, '-')         // Bir veya daha fazla boşluğu '-' yap
    .replace(/[^a-z0-9\-]/g, '')  // Harf, rakam ve '-' dışındakileri sil
    .replace(/-+/g, '-');          // Birden fazla '-' varsa tek yap
}




    const gameplayEmbedId = getYouTubeID(gameplayEmbed)
    const urlTitle = toSlug(name)
    images=images.split(',')


try {
  const newPage = new Page({
    url: urlTitle,
    lastmod: new Date()
  });

  await newPage.save();
} catch (err) {
  console.log(err);
  res.send("Xeta bas verdi");
}

    const newGame = new Game({
        name, category,gameOutDate,summary,system,cover,gameplayEmbed:gameplayEmbedId,images,linkTorrent,linkDirect,linkDirectAlternative,size,urlTitle
    });

    newGame.save()
    .then((savedGame)=>{
        res.redirect(`/${urlTitle}`)
    })
    .catch((err)=>{
        res.send("Xeta bas verdi")
        console.log(err)
    })
})

router.get("/add-index",checkAdmin,(req,res)=>{
res.render("admin/addIndex")


})
router.post("/add-index",checkAdmin,(req,res)=>{
    const {url, changefreq, priority} = req.body
    const lastmod = new Date().toISOString();
    const newPage = new Page({
        url,
        changefreq,
        priority,
        lastmod
    })
    newPage.save()
    .then(()=>{
        res.redirect("/admin/add-index")
    })
    .catch(err=>{
        res.send("Xeta bas verdi")
        console.log(err)
    })
})


router.get("/game/update/:gameId",checkAdmin,(req,res)=>{
    const id = req.params.gameId
    Game.findById(id).lean()
    .then(game=>{
    game.gameOutDate = moment(game.gameOutDate, 'YYYY-MM-DD').format('').slice(0,10) || ""
console.log(game.gameOutDate)
        // res.render('game/game',{game})
        res.render("admin/gameUpdateAlone",{game})
    })
    .catch(err=>{
        res.send('404')
      
    })
})



//games editing

router.get("/game/delete/:gameId",checkAdmin,(req,res)=>{
    var id = req.params.gameId
    Game.findOneAndDelete({_id:id})
    .then(()=>{
        res.redirect("/admin/game/update")
    })
    .catch(err=>{
        res.send("Silerken problem emele geldi")
    })
    
    
    })


//login - auth

router.get("/login", (req,res)=>{
    res.render("admin/login")
})
router.post("/login",(req,res)=>{
    const hash = req.body.hash
    if(hash){
        if(req.session.admin == true ){
            res.redirect('/admin')
        } else if(hash == adminHash){
            req.session.admin = true
            res.redirect("/admin")
        } else {
            res.redirect('/admin/login')
        }
    } else {
        res.redirect('/admin/login')
    }
})



module.exports=router