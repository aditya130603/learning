/* Two additional short, manually authored, concrete facts for each of the 130
 * alphabet words. The existing first fact comes from GuidedJourneyV8.FACTS. */
(function(root){'use strict';
var extra={
A:[
'Ants have six legs.~Ants sometimes build nests called anthills.',
'Apples grow on apple trees.~An apple has seeds inside.',
'Your arm joins your shoulder to your hand.~Your arm bends at the elbow.',
'An axe has a sharp blade.~People use axes to chop wood.',
'We breathe air every day.~Moving air is called wind.'],
B:[
'A cricket bat has a handle.~Bats are used to hit a ball in cricket.',
'A bag helps us carry books.~Many bags have handles or straps.',
'A bus has many seats.~Buses stop to pick up passengers.',
'A bed usually has a mattress.~We use beds to sleep and rest.',
'A ball can be round.~Many games are played with a ball.'],
C:[
'Cats have soft paws.~Baby cats are called kittens.',
'A car has wheels.~Cars need a driver.',
'Cups can hold milk or water.~Some cups have handles.',
'A cap goes on your head.~A cap can help shade your face.',
'Cows eat grass.~Baby cows are called calves.'],
D:[
'Dogs can bark.~A baby dog is a puppy.',
'Dad is another word for father.~Some children call their father Papa.',
'A den can shelter an animal.~Some foxes raise young in dens.',
'Ducks have feathers.~Ducks can swim in water.',
'Dolls can be made from cloth or plastic.~Children often use dolls for pretend play.'],
E:[
'Many birds hatch from eggs.~Eggs usually have shells.',
'You have one ear on each side of your head.~Ears help you hear sounds.',
'You have two eyes.~Your eyelids protect your eyes.',
'You use your mouth to eat.~Eating gives your body energy.',
'Elves appear in many fairy tales.~An elf is an imaginary character.'],
F:[
'A fan has moving blades.~Fans can move cool air towards you.',
'A fox has a bushy tail.~Foxes are wild animals.',
'Fish live in water.~Most fish have fins.',
'Fun means enjoying an activity.~Playing games can be fun.',
'Figs are fruits.~Many figs have tiny seeds inside.'],
G:[
'Goats eat plants.~A baby goat is called a kid.',
'A girl can be a child or teenager.~Girls can learn and play any sport.',
'A gift can be wrapped in paper.~We give gifts on special occasions.',
'A gate can be made of wood or metal.~A gate can open and close.',
'Many games have rules.~Games can be played alone or together.'],
H:[
'Hats come in many shapes.~Some hats protect us from the sun.',
'Hens can lay eggs.~A hen is an adult female chicken.',
'A hut is a small shelter.~Huts can be built from wood or mud.',
'When you hop you take a little jump.~Rabbits often hop.',
'Your hand has fingers.~You use your hands to hold things.'],
I:[
'Ink can be blue or black.~Pens use ink to make marks.',
'Ice is cold.~Ice melts into water when warmed.',
'In is the opposite of out.~A toy can be in a box.',
'An igloo is a dome-shaped shelter.~Some igloos are made of packed snow.',
'An insect has six legs.~Many insects have antennae.'],
J:[
'Jam is usually sweet.~Jam is often made with fruit.',
'Jets can fly high in the sky.~A jet is a kind of aircraft.',
'A jug can hold water.~Some jugs have a handle.',
'Jars often have lids.~A jar can store food.',
'A jeep has four wheels.~Some jeeps can travel on rough roads.'],
K:[
'Keys can unlock doors.~Different locks need different keys.',
'Kid means child.~A baby goat is also called a kid.',
'A kite needs wind to fly.~Many kites have a string.',
'A king may wear a crown.~In stories a king may live in a palace.',
'A kit is a group of useful things.~A first-aid kit contains supplies.'],
L:[
'Your legs help you run.~Your knees let your legs bend.',
'A log comes from a tree.~Logs can be used as firewood.',
'Your lips help make speech sounds.~You have an upper and lower lip.',
'A lid covers a container.~A lid can keep dust out.',
'Lions are big cats.~A male lion may have a mane.'],
M:[
'A man is an adult human.~Men can work in many kinds of jobs.',
'A mat can lie on the floor.~We sometimes wipe our shoes on a mat.',
'Maps can show cities.~A map can help you find your way.',
'A mop helps clean floors.~Some mops use water.',
'The Moon can be seen at night.~The Moon orbits Earth.'],
N:[
'A net is made with many holes.~Nets can catch balls in sports.',
'Some nuts grow on trees.~Many nuts have hard shells.',
'Your nose helps you smell.~You breathe through your nose.',
'Birds use nests to protect eggs.~Some nests are built from twigs.',
'A nail can fasten wood together.~Nails are often tapped with a hammer.'],
O:[
'An ox is a large farm animal.~Some oxen help pull carts.',
'On is the opposite of off.~A book can be on a table.',
'Owls are birds.~Many owls hunt at night.',
'Cooking oil is used in kitchens.~Oil floats on water.',
'Oranges are citrus fruits.~You can peel an orange.'],
P:[
'A pen is used for writing.~Some pens have blue ink.',
'Pigs are farm animals.~Baby pigs are called piglets.',
'A pan is used for cooking.~Many pans have handles.',
'A pot can hold soup.~Cooking pots are often made of metal.',
'A pin is small and pointed.~A pin can fasten pieces of cloth.'],
Q:[
'A queen may wear a crown.~Some queens rule countries.',
'A quiz is made of questions.~A quiz can help test what you know.',
'A quilt is often made of fabric.~A quilt can keep you warm.',
'Quack is the sound a duck makes.~Quack is an action word.',
'A quail is a small bird.~Quails can lay eggs.'],
R:[
'Rats are rodents.~Rats have long tails.',
'Red is a colour.~Tomatoes are often red.',
'Running is faster than walking.~You use your legs to run.',
'A rug can be put on a floor.~Many rugs are made of woven threads.',
'Roses are flowers.~Some roses have thorns.'],
S:[
'The Sun gives Earth light.~Never stare directly at the Sun.',
'You can sit on a chair.~Sitting is different from standing.',
'Six is one more than five.~Six is written with the digit 6.',
'Socks cover your feet.~Socks often come in pairs.',
'Stars shine in the night sky.~Our Sun is also a star.'],
T:[
'A tap can give us water.~Close the tap to save water.',
'Top can mean the highest place.~A spinning top is also a toy.',
'A tub can hold water.~Some people use tubs for bathing.',
'Ten is two more than eight.~The number ten is written 10.',
'Toys are made for play.~Some toys have wheels.'],
U:[
'Up means moving higher.~Up is the opposite of down.',
'Us means you and me together.~Us refers to more than one person.',
'An urn is a container.~Some urns are made of clay.',
'An uncle is a family relative.~An uncle may be a parent’s brother.',
'Under means below something.~A ball can roll under a bed.'],
V:[
'A van is a road vehicle.~Vans can carry goods or people.',
'A vet takes care of animals.~A vet can help sick pets.',
'A vest is a kind of clothing.~Some vests have no sleeves.',
'A vase can hold flowers.~Vases can be made of glass.',
'A vine is a climbing plant.~Some vines grow grapes.'],
W:[
'Spiders spin webs.~A web can catch insects.',
'Rain can make the ground wet.~Wet is the opposite of dry.',
'A wig is artificial hair.~People sometimes wear wigs for costumes.',
'Win means succeed in a game.~Winning is the opposite of losing.',
'Walls can be made of bricks.~Walls can divide rooms.'],
X:[
'An X-ray is a type of medical image.~Doctors use X-rays to examine bones.',
'A xylophone makes musical sounds.~You play a xylophone by tapping bars.',
'A box can hold toys.~Many boxes have lids.',
'Foxes have pointed ears.~A fox has a bushy tail.',
'Six comes after five.~Six is written with the number 6.'],
Y:[
'Yaks have long hair.~Yaks live in cold mountain areas.',
'Yams are root vegetables.~Yams grow underground.',
'Yes is used to agree.~Yes is the opposite of no.',
'Yarn is made of fibres.~Yarn is used for knitting.',
'An egg yolk is inside the egg.~Yolks are usually yellow or orange.'],
Z:[
'A zoo houses many animals.~Different zoo animals need different habitats.',
'A zip can close a bag.~You pull a zip slider to open it.',
'Zero means none.~Zero is written 0.',
'Zebras have stripes.~Zebras are related to horses.',
'A zigzag line turns left and right.~Lightning is often drawn as a zigzag.']
};
var bank={};Object.keys(extra).forEach(function(letter){bank[letter]=extra[letter].map(function(pair){return pair.split('~');});});
root.WordFactsV9={get:function(letter,word){var entry=root.WORD_BANK&&root.WORD_BANK.find(function(w){return w.letter===letter;});if(!entry)return [];var idx=entry.words.findIndex(function(w){return w.text===word;});return bank[letter]&&bank[letter][idx]||[];},count:Object.keys(bank).reduce(function(n,k){return n+bank[k].length;},0)};
})(window);
