document.addEventListener('DOMContentLoaded', function() {
  // Profile image flip animation
  var container = document.querySelector('.profile-img-container');
  var img = document.getElementById('main-profile-img');
  if (container && img) {
    container.addEventListener('mouseenter', function() {
      img.classList.add('flipped');
    });
    container.addEventListener('mouseleave', function() {
      img.classList.remove('flipped');
    });
  }

  // Initialize variables for typing animations
  var nameToType = document.getElementById('typed-name').getAttribute('data-name');
  var skillsString = document.getElementById('typed-skills').getAttribute('data-skills');
  var skillsList = skillsString.split(',').map(function(skill) {
    skill = skill.trim();
    // Check if the skill starts with a vowel
    var startsWithVowel = /^[aeiou]/i.test(skill);
    return '<span style="font-weight: normal">I am ' + (startsWithVowel ? 'an' : 'a') + ' </span>' + skill + '.';
  });

  // Name typing animation
  var typedName = new Typed('#typed-name', {
    strings: [nameToType],
    typeSpeed: 30,
    showCursor: true,
    cursorChar: '|',
    onComplete: function(self) {
      // Hide the cursor for name animation
      self.cursor.style.display = 'none';
      // Start skills animation after name is complete
      startSkillsAnimation();
    }
  });

  function startSkillsAnimation() {
    var typedSkills = new Typed('#typed-skills', {
      strings: skillsList,
      typeSpeed: 30,
      backSpeed: 20,
      backDelay: 1000,
      loop: true,
      showCursor: true,
      cursorChar: '|'
    });
  }
}); 