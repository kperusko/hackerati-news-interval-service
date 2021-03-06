var Story = require('../models/story');
var Score = require('../models/score');

// Get all stories for a given snapshot_id
module.exports.getStories = function (req, res, next) {
  Story.find({
      'scores.snapshot': req.params.snapshot_id
    },
    null,
    function (err, stories) {
      if (err) return next(err);

      res.json(stories);
    });
};

// Get all story Ids
module.exports.getStoryIds = function (req, res, next) {
  Story.find({}, '_id', function (err, stories) {
    if (err) return next(err);

    var ids = stories.map(function (val) {
      return val._id;
    });
    res.json(ids);
  });
};

// Get a single story
module.exports.getStory = function (req, res, next) {
  Story.findOne({
    _id: req.params.story_id
  }, function (err, story) {
    if (err) return next(err);
    if (!story) return next(); // return 404 if story doesn't exist

    res.json(story);
  });
};

// Create or update a story by story_id
module.exports.updateStory = function (req, res, next) {
  Story.findById(req.params.story_id, function (err, story) {
    if (err) return next(err);

    var isNew = false;
    // Create a new story with given story_id
    // if the resource doesn't exist
    if (!story) {
      story = new Story();
      isNew = true;
    }

    story._id = req.params.story_id;
    story.title = req.body.title;
    story.url = req.body.url;
    story.by = req.body.by;
    story.created = req.body.created;

    story.scores = req.body.scores;

    story.save(function (err) {
      if (err) return next(err);
      if (isNew)
        res.status(201);

      res.json(story);
    });
  });
};

// Add new score for the story
module.exports.updateScore = function (req, res, next) {
  Story.findById(req.params.story_id, function (err, story) {
    if (err) return next(err);

    // We're supporting only adding scores
    if (req.body.op !== 'add' || req.body.path !== 'scores') {
      var error = new Error('Unprocessable Entity');
      error.status = 422;
      next(error);
    } else {
      var score = new Score();
      score.score = req.body.value.score;
      score.rank = req.body.value.rank;
      score.snapshot = req.body.value.snapshot;

      story.scores.push(score);

      story.save(function (err) {
        if (err) return next(err);
        res.json(story);
      });
    }
  });
};
