/* More authored story prompts. The existing simple two-choice kids controller is retained. */
(function(root){'use strict';
var game=root.WORD_MAYHEM;if(!game||!Array.isArray(game.missions))return;
var rows=[
['fox-tree','4-6','Fox and the tree','Help the fox reach its friend.','fox','climbs','sleeps','climb','','The fox climbs up safely!','The fox falls asleep under the tree.'],
['rabbit-carrot','4-6','The hungry rabbit','Help the rabbit find lunch.','rabbit','finds','hides','find','','The rabbit finds a crunchy carrot!','The rabbit hides instead of eating.'],
['bird-morning','4-6','Morning song','Make the garden sound happy.','bird','sings','sleeps','sing','','The bird sings a lovely song!','The bird sleeps through sunrise.'],
['puppy-ball','4-6','Catch the ball','Help the puppy play fetch.','puppy','catches','drops','catch','','The puppy catches the bouncing ball!','Oops, the ball rolls away!'],
['bee-flower','4-6','The little bee','Help the bee reach the flower.','bee','lands','wanders','land','','The bee lands on a beautiful flower.','The bee wanders in the wrong direction.'],
['mouse-door','4-6','Open the tiny door','Help the mouse enter its house.','mouse','opens','closes','open','','The mouse opens the little door!','The mouse shuts it instead.'],
['panda-bamboo','4-6','Panda picnic','Help the panda eat lunch.','panda','eats','throws','eat','','The panda enjoys the bamboo!','The panda throws away lunch.'],
['turtle-race','4-6','The turtle race','Help the turtle reach the finish.','turtle','walks','naps','walk','','Slow and steady! The turtle walks ahead.','The turtle stops for a long nap.'],
['chef-soup','7-9','Soup for everyone','Serve warm soup to the visitors.','chef','serves','spills','serve','the soup','Everyone enjoys a tasty soup!','Oh no! Soup splashes everywhere.'],
['wizard-door','7-9','The secret doorway','Open the castle door safely.','wizard','unlocks','breaks','unlock','the door','The castle door opens with a click!','The wizard breaks the old door.'],
['captain-map','7-9','Find the island','Get the crew to the right island.','captain','reads','burns','read','the map','The crew discovers the hidden island!','Oh no! The map turns to ash.'],
['gardener-seeds','7-9','Grow a garden','Make new flowers appear.','gardener','plants','eats','plant','the seeds','Little flowers begin to grow.','The seeds disappear into lunch.'],
['artist-paint','7-9','The festival mural','Make the dull wall colourful.','artist','paints','scratches','paint','the wall','A bright mural lights up the street!','The wall ends up covered in scratches.'],
['astronaut-light','7-9','Light the spaceship','Turn on the cabin lights.','astronaut','switches','breaks','switch','the lights','The spaceship glows beautifully!','The cabin stays dark after the accident.'],
['doctor-puppy','7-9','Help the puppy','Make the puppy feel better.','doctor','checks','ignores','check','the puppy','The puppy feels safe and cared for!','The puppy still needs help.'],
['robot-books','7-9','Library helper','Put the books back in order.','robot','sorts','scatters','sort','the books','The library shelves look neat!','Books are scattered everywhere.'],
['dancer-stage','7-9','The concert','Help the dancer perform.','dancer','practises','forgets','practise','the steps','The dancer remembers every step!','The dancer forgets what to do.'],
['farmer-water','7-9','The thirsty field','Help the vegetables grow.','farmer','waters','ignores','water','the plants','The plants rise healthy and strong.','The leaves droop in the hot sun.'],
['pirate-compass','7-9','Lost at sea','Find the correct direction.','pirate','follows','throws','follow','the compass','The ship finds its way through the mist!','The compass sinks into the sea.'],
['child-umbrella','7-9','Rainy day rescue','Keep your friend dry in the rain.','child','shares','hides','share','the umbrella','Both friends walk home dry!','One friend gets soaked by rain.'],
['scientist-potion','10-13','The laboratory','Find out what made the potion change colour.','scientist','examines','ignores','examine','the mixture','The scientist discovers an important clue!','The clue disappears when nobody investigates.'],
['explorer-cave','10-13','The hidden cave','Keep everyone safe before entering.','explorer','inspects','ignores','inspect','the entrance','A safe path through the cave is found!','The team enters without checking for danger.'],
['pilot-storm','10-13','Storm warning','Protect the passengers from heavy weather.','pilot','avoids','chases','avoid','the storm','The plane flies around the storm safely!','The plane heads into the worst weather.'],
['journalist-claim','10-13','The big headline','Check the story before sharing it.','journalist','verifies','inventories','verify','the facts','A well-checked story reaches the readers!','The headline confuses everyone.'],
['coach-team','10-13','The final match','Help the team play as one group.','coach','motivates','discourages','motivate','the team','The team comes together with confidence!','The team loses hope before the game.'],
['inventor-engine','10-13','The strange machine','Solve why the engine stopped.','inventor','repairs','damages','repair','the engine','The engine starts working again!','Smoke pours out of the broken engine.'],
['curator-painting','10-13','The museum mystery','Protect the old painting from sunlight.','curator','shields','exposes','shield','the painting','The colours of the painting stay bright!','Sunlight fades the delicate colours.'],
['captain-signal','10-13','Rescue at sea','Tell the nearby ship where to go.','captain','transmits','deletes','transmit','the signal','The rescue ship receives the location!','Nobody receives the missing signal.'],
['librarian-records','10-13','Missing information','Find the book before the visitor leaves.','librarian','organises','misplaces','organise','the records','The librarian finds the needed book quickly!','The record is lost among the shelves.'],
['architect-bridge','10-13','Bridge over the river','Make sure the bridge is safe.','architect','reinforces','weakens','reinforce','the supports','The bridge can safely carry the crowd!','The bridge remains dangerously weak.'],
['ranger-fire','10-13','Forest in danger','Protect the animals from the fire.','ranger','evacuates','abandons','evacuate','the animals','The animals reach a safe clearing!','The animals are left near the fire.'],
['chemist-sample','10-13','The mysterious sample','Record what is actually in the solution.','chemist','analyses','discards','analyse','the sample','The solution is finally understood!','A valuable sample gets thrown away.']
];
function create(r){var id=r[0],age=r[1],name=r[2],goal=r[3],subject=r[4],winVerb=r[5],oopsVerb=r[6],badVerb=r[7],obj=r[8],winText=r[9],oopsText=r[10];
var object=obj?obj.split(' '):[],tiles=['The',subject,winVerb,oopsVerb,badVerb].concat(object);
var meaning={};meaning[winVerb]='The action that helps in this story.';meaning[oopsVerb]='Another action with a different outcome.';
return {id:id,age:age,name:name,goal:goal,place:'Story adventure',scene:'',base:'',win:'',oops:'',
subject:subject,winVerb:winVerb,oopsVerb:oopsVerb,badVerb:badVerb,object:object,tiles:tiles,
subjectHint:'one '+subject,winText:winText,oopsText:oopsText,
rule:'Use “'+winVerb+'” with one '+subject+'. The base verb “'+badVerb+'” needs agreement.',
meaning:meaning,
tip:'Think about what the story needs, then choose the action that helps.'};}
var existing={};game.missions.forEach(function(m){existing[m.id]=true;});rows.forEach(function(row){if(!existing[row[0]])game.missions.push(create(row));});
root.WordMayhemExtended={added:rows.length,total:game.missions.length,byAge:function(tier){return game.forAge(tier).length;}};
})(window);
