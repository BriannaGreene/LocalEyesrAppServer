var express = require('express')
var router = express.Router()
const Twit = require('twit')
const t = new Twit({
  consumer_key: `${process.env.TWITTER_CONSUMER_KEY}`,
  consumer_secret: `${process.env.TWITTER_CONSUMER_SECRET}`,
  access_token: `${process.env.TWITTER_ACCESS_TOKEN}`,
  access_token_secret: `${process.env.TWITTER_ACCESS_SECRET}`
})


// return json object of top twitter trends in colorado
router.get('/trends', function(req, res, next) {
  let filteredTrends = []
  t.get('trends/place', { id: 2391279, count: 10 }, gotData)
  // filter data from twitter API call
  function gotData(err, data, response) {
    // TRENDS BY LOCATION, ORGANIZED BY POPULARITY
    const trends = data[0].trends.map(item => item.name)
    const trendsWithVolume = data[0].trends.filter(item => {
      if (item.tweet_volume) {
        filteredTrends.push({
          name: item.name,
          tweets: item.tweet_volume
        })
      }
    })
    // sort objects in arrary by tweet volume
    let sort_by = function(field, reverse, primer){
      let key = primer ?
        function(x) {return primer(x[field])} :
        function(x) {return x[field]};
      reverse = -1
      return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
      }
    }
    filteredTrends.sort(sort_by('tweets'))
    // cut array down to top 8
    let top8Trends = filteredTrends.slice(0, 8)
    return res.send(top8Trends)
  }
})


// get related hashtags from client search request
router.get('/related', function(req, res, next) {
  // console.log('req from related: ', req);
  t.get('search/tweets', { q: `${req.query.term}`, count: 200 }, gotData)
  // filter data from twitter API call
  function gotData(err, data, response) {
    // get just hashtags
    const relatedHashtags = data.statuses.map(item => item.entities.hashtags)
    // remove empty arrays from data
    const filteredHashtags = relatedHashtags.filter(item => {
      if (item.length > 0) {
        return item
      }
    })
    // remove other data entities
    const justHashtags = []
    const hashtagTextOnly = filteredHashtags.map(item => {
      for (var i = 0; i < item.length; i++) {
        justHashtags.push(item[i].text)
      }
    })
    justHashtags.sort()
    // group the same hashtag together and keep track of occurrence
    const hashtagWithCount = justHashtags.reduce(function (acc, curr) {
      if (typeof acc[curr] == 'undefined') {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }
      return acc;
    }, {});
    const dataArray = []
    for (var k in hashtagWithCount) {
      let hashObj = {hash: k, count: hashtagWithCount[k]}
      dataArray.push(hashObj)
    }
    return res.send(dataArray)
  }
})


// most recent tweets about denver
router.get('/denver', function(req, res, next) {
  t.get('search/tweets', { q: 'Denver', count: 5 }, gotData)
  // filter data from twitter API call
  function gotData(err, data, response) {
    if (data.statuses.length <= 3) {
      let denverFiller = [ { created_at: 'Wed Nov 22 01:38:10 +0000 2017',
        text: 'RT @wojespn: Denver Nuggets forward Paul Millsap\'s surgery will be to repair a torn ligament in his left wrist and could sideline him for t…',
        hashtags: 'none' },
      { created_at: 'Wed Nov 22 01:38:08 +0000 2017',
        text: 'RT @wojespn: Denver Nuggets forward Paul Millsap\'s surgery will be to repair a torn ligament in his left wrist and could sideline him for t…',
        hashtags: 'none' },
      { created_at: 'Wed Nov 22 01:38:01 +0000 2017',
        text: 'Denver Nuggets Lose Paul Millsap Indefinitely After Wrist Injury He Suffered in Loss to Lakers https://t.co/9sAkdMwfwX @danfavale',
        hashtags: 'none' },
      { created_at: 'Wed Nov 22 01:37:57 +0000 2017',
        text: '@metaskills Let me know how you like it, I went to the distillery where they bottle it when I was in Denver :)',
        hashtags: 'none' } ]
        return res.send(denverFiller)
    }
    let filteredDenver = data.statuses.slice(0, 3).map(item => {
      if (item.entities.hashtags.length === 0) {
        return {
          created_at: item.created_at,
          text: item.text,
          hashtags: 'none'
        }
      }
      let hashtags = item.entities.hashtags[0].text
      return {
        created_at: item.created_at,
        text: item.text,
        hashtags: hashtags
      }
    })
    return res.send(filteredDenver)
  }
})

// most recent tweets for top trend
router.get('/tweets', function(req, res, next) {
  t.get('search/tweets', { q: `${req.query.term}`, count: 5 }, gotData)
  // filter data from twitter API call
  function gotData(err, data, response) {
    let filteredTweets = data.statuses.slice(0, 3).map(item => {
      if (item.entities.hashtags.length === 0) {
        return {
          created_at: item.created_at,
          text: item.text,
          hashtags: 'none'
        }
      }
      let hashtags = item.entities.hashtags[0].text
      return {
        created_at: item.created_at,
        text: item.text,
        hashtags: hashtags
      }
    })
    return res.send(filteredTweets)
  }
})


module.exports = router;
