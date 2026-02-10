Feb 10, 2026 Update

Added a Navbar to let users navigate between different sections of the site more easily

Styled the tables for (hopefully) more visibility, including visible borders and zebra striping

Added ascending/descending sorting by wishlists, character name, and series names

Added buttons for automatically selecting bulk cards, as well as an input for letting users define at what wishlist count they consider bulk

Added a feature to let users click on character or series names to copy them to their clipboard in case they want a refresher on the given card
(Maybe later I'll add a way to combine both into the clipboard.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
I made this site to try learning how IndexedDB and Dexie work. 
While learning the flowchart was fun and made sense, I could never remember the syntaxes by heart.

Anyways, this is a site to be used with the Karuta Discord Bot made by Craig.
You upload your .csv (obtained by using ksheet) and you can filter and view your collection much like with the bot.
Yes, you use the same keywords and filters like s:series and print<10.

The main point of this site is to help users quickly mass-tag their cards (especially all their bulk into their burn tags).
I believe using this site is a massive convenience compared to only using the Karuta bot because:

1) The Karuta bot only lets users view 10 cards per page, and scrolling takes at least a second per page.
This adds up very fast and can be tiresome for people with massive collections.
Besides letting users view 20 cards a page,
This site lets users either click many singleton cards into one tag, one click for many cards, or a combination, all while:
  avoiding the hard 1000 card limit for kc command (let alone trying to check the 1001st+ cards themselves)
  awkwardly relying on helper bots to copy-paste off of, which may inadvertantly add cards you don't want listed in the copypasta.
  cramping your left hand that's spamming Ctrl-C Ctrl-V

2) The Karuta bot's hard 5 second cooldown per query can be an annoyance
  This site lets users fix query mistakes, typos, etc., without being punished for it.

3) Users only being able to see cards' codes but not the other contents when viewing en masse can make things messy/awkward fast in Discord
This site has a second table for users to view that contains the cards they have selected thus far, that continues to show their details
  This more easily lets users ensure that only the correct cards will be tagged.

Flowchart
1. Use the site's search features to filter to the cards user wishes to select
2. Use cards' checkboxes (or the very top checkbox to select all matching results) to add to the table
3. Use the Tag input to name a tag to place all selected cards into
4. Scroll to bottom of page and Copy-Paste the generated message onto Discord wherever the Karuta bot is present
    or just Discard Change if you change your mind
5. Click Apply Change once you have used the tag message to reflect these changes onto the collection (until your next upload)

Of course, because this uses your .csv to show your collection, this doesn't auto-update with your actual Karuta collection, but you're free to re-upload as needed (per 24 hours due to Karuta's own ksheet restriction)

Questions I predict I have to answer:
Q: Will you see the collection I upload to this site?
A: No, IndexedDB is local to the device you work with. I can't see anything you put up to the site, and I'm too lazy to hunt for your SPs/LPs/MPs

Q: I filtered for [bulk cards] but my [big ticket] item(s) got thrown in too.
A: I want to try to fix these sorts of issues up while I still passion for this project. 
However, you probably still want to double check that only the cards you really want to give that tag to are selected before it's too late.

Q: I have a suggestion/comment for you.
A: Drop it wherever, and if I look back at this repo, I'll check it out.

Q: [Something about sharing, modifying, etc. this site]
A: To be honest, go for it. I made this to work on my skills.

TODO List:
-Add hotkeys for cycling through pages, search filter/tagging boxes, etc.
-Adding an indicator of the most recent tagging message box that has been interacted with
-Wish to make site more user friendly
