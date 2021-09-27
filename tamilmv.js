const cheerio = require('cheerio');
const axios = require('axios');

function parseFrontPageData(data){
    const $ = cheerio.load(data)
    var finData = []
    // var p =  $('.ipsWidget_inner','.ipsPad', '.ipsType_richTex');
    var p = $("p[style='font-size: 12.4px; font-family: Arial, Helvetica, sans-serif; font-weight: 500; line-height: 1.7rem; font-stretch: expanded;']")

    // var span = cheerio.load(p.html());
    var tags = p.html().split("<br>")

    for (var j=0; j < 50; j++){
        var tag = tags[j];
        var txt = cheerio.load(tag);
        var title = txt("span[ipsnoautolink]").html()

        var links = []

        for (var i=0; i < txt("a").length; i++){
            links.push(txt("a")[i].attribs.href)
        }

        finData.push({title:title,urls:links})

    }
    

    // console.log(finData)
    return finData;
}

function parsePageData(data){
    // console.log(data)
    const pattern = cheerio.load(data)
    var rp = cheerio.load(pattern("p[style]").html())
    var magnetUrls = [];
    rp('a').each((ind, ele)=>{
        if( rp(ele).attr('href').startsWith('magnet') ){
            magnetUrls.push(rp(ele).attr('href'));
        }
    });
    var i = 0;
    var finData = {
        images:[],
        magnet_urls:magnetUrls
    }
    rp('img').each((ind,ele)=>{
        if (i < 3) {
        finData.images.push({name:rp(ele).attr('alt'), image_url:rp(ele).attr('src')})
        }
        i++;
    })
    // console.log(finData)

    return finData;
    
}


const getPageData = async (url) => {
    var response =  await axios.get(url);
    var parsedData = parsePageData(response.data);
    //  console.log(parsedData)
    return parsedData;
}


axios.get("https://www.1tamilmv.guru/").then(async (res)=>{
    var data = parseFrontPageData(res.data);
    // console.log(data)
    var promises = []
    var finalData = [];
    for (var i = 0; i < 10; i++ ){
        promises.push(getPageData(data[i].urls[0]).then((d)=>{
            finalData.push(d);
        }));
    }
    var stringifiedData = {};
    var num = 0;
    Promise.all(promises).then(()=>{ 
        // console.log(num, ' ' ,finalData)
        for (var i =0 ; i < finalData.length; i++){
            finalData[i]['title'] = data[i].title;
        }
        // console.log(finalData);
         stringifiedData = JSON.stringify(finalData);
        console.log(stringifiedData);
        // for (var i= 0; i < stringifiedData.length; i++){
        //     stringifiedData[i]['title'] = "hello world";
        // }
    }).catch((err)=>{
        console.log(err);
    });

}
).catch((err)=>{
    console.log(err);
});