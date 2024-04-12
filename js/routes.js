import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";
import articleFormsHandler from "./articleFormsHandler.js";

//an array, defining the routes
export default[

    {
        //the part after '#' in the url (so-called fragment):
        hash:"welcome",
        ///id of the target html element:
        target:"router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate:(targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML
    },
    {
        hash:"articles",
        target:"router-view",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash:"opinions",
        target:"router-view",
        getTemplate: createHtml4opinions
    },
    {
        hash:"addOpinion",
        target:"router-view",
        getTemplate: (targetElm) =>{
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML;
            document.getElementById("opnFrm").onsubmit=processOpnFrmData;
        }
    },

    {
        hash:"article",
        target:"router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },
    
    {
        hash:"artEdit",
        target:"router-view",
        getTemplate: editArticle
    },
    
    {
        hash:"artDelete",
        target:"router-view",
        getTemplate: artDelete
    },

    {
        hash:"artInsert",
        target:"router-view",
        getTemplate: artInsert
    },

    {
        hash: "artComment",
        target: "comments",
        getTemplate: comments
    },

    {
        hash: "addComment",
        target: "comments",
        getTemplate: addComment
    },
];


const urlBase = "https://wt.kpi.fei.tuke.sk/api";
//const urlBase = "http://192.168.56.101/api";
const articlesPerPage = 5;  

function createHtml4opinions(targetElm){
    const opinionsFromStorage=localStorage.myTreesComments;
    let opinions=[];

    if(opinionsFromStorage){
        opinions=JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            opinion.created = (new Date(opinion.created)).toDateString();
            opinion.willReturn = opinion.willReturn?"I will return to this page.":"Sorry, one visit was enough.";
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );
}

function fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash){

    const current = isNaN(offsetFromHash) ? 1 : Number(offsetFromHash);
    const totalCount = isNaN(totalCountFromHash) ? 1 : Number(totalCountFromHash);

    const data4rendering={
        currPage:current,
        pageCount:totalCount
    };

    if(current>1){
        data4rendering.prevPage=current-1;
    }

    if(current<totalCount){
        data4rendering.nextPage=current+1;
    }
    
    let premenna = (current*articlesPerPage)-articlesPerPage;
    
    //const url = "http://192.168.56.101/api/article?max="+articlesPerPage+"&offset="+premenna+"&tag=sport";
    const url = "https://wt.kpi.fei.tuke.sk/api/article?max="+articlesPerPage+"&offset="+premenna+"&tag=sport";

    function reqListener () {
        // stiahnuty text
        console.log(this.responseText)
        if (this.status == 200) {
            const responseJSON = JSON.parse(this.responseText)
            console.log(responseJSON);
            data4rendering.pageCount=Math.ceil(responseJSON.meta.totalCount/articlesPerPage);
            addArtDetailLink2ResponseJson(responseJSON);
            data4rendering.articles=responseJSON.articles;

            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles").innerHTML,
                    data4rendering
                );

        } else {
            const errMsgObj = {errMessage:this.responseText};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        }
        
    }

    console.log(url);
    var ajax = new XMLHttpRequest(); 
    ajax.addEventListener("load", reqListener); 
    ajax.open("GET", url, true); 
    ajax.send();
} 

function addArtDetailLink2ResponseJson(responseJSON){
  responseJSON.articles = responseJSON.articles.map(
    article =>(
     {
       ...article,
       detailLink:`#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`
     }
    )
  );
}    
 
function fetchAndDisplayArticleDetail(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash) {
    fetchAndProcessArticle(...arguments,false);
}  

function artInsert(targetElm) {
    // Render the artInsert template
    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-artInsert").innerHTML,
        {
            formTitle: "Create New Article",
            submitBtTitle: "Create Article",
            author: "",
            title: "",
            imageLink: "",
            content: "",
            tags: ""
        }
    );

    // Attach event listener to the form for submission handling
    document.getElementById("articleForm").onsubmit = function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        const formData = new FormData(event.target);

        // Convert formData to JSON
        const formDataJSON = {};
        formData.forEach((value, key) => {
            formDataJSON[key] = value;
        });

        // Send a request to create a new article
        fetch(`${urlBase}/article`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataJSON)
        })
            .then(response => response.json())
            .then(data => {
                // Handle success (you may want to add error handling as well)
                console.log("Article created successfully:", data);

                // Redirect to the articles view
                window.location.hash = "#articles";
            })
            .catch(error => {
                console.error("Error creating article:", error);
            });
    };
}


function artDelete(targetElm, id){
    const serverUrl = "https://wt.kpi.fei.tuke.sk/api/article";
    //const serverUrl = "http://192.168.56.101/api/article";
    fetch(serverUrl + '/' + id, {
        method: 'DELETE'

    }).then(function (response){
        window.location.hash = '#articles';
    });
}

/**
 * Gets an article record from a server and processes it to html according to 
 * the value of the forEdit parameter. Assumes existence of the urlBase global variable
 * with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
 * availability of the Mustache.render() function and Mustache templates )
 * with id="template-article" (if forEdit=false) and id="template-article-form" (if forEdit=true).
 * @param targetElm - id of the element to which the acquired article record 
 *                    will be rendered using the corresponding template
 * @param artIdFromHash - id of the article to be acquired
 * @param offsetFromHash - current offset of the article list display to which the user should return
 * @param totalCountFromHash - total number of articles on the server
 * @param forEdit - if false, the function renders the article to HTML using 
 *                            the template-article for display.
 *                  If true, it renders using template-article-form for editing.
 */

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments,true);
}     

function fetchAndProcessArticle(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash,forEdit){
    const url = `${urlBase}/article/${artIdFromHash}`;  

    function reqListener () {
        // stiahnuty text
        console.log(this.responseText)
        if (this.status == 200) {
            const responseJSON = JSON.parse(this.responseText)
            if(forEdit){
                responseJSON.formTitle="Article Edit";
                responseJSON.submitBtTitle="Save article";
                responseJSON.backLink=`#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;
            
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );
                if(!window.artFrmHandler){
                    window.artFrmHandler= new articleFormsHandler("https://wt.kpi.fei.tuke.sk/api");
                    //window.artFrmHandler= new articleFormsHandler("http://192.168.56.101/api");
                }
                window.artFrmHandler.assignFormAndArticle("articleForm","hiddenElm",artIdFromHash,offsetFromHash,totalCountFromHash);
            }else{                                       
                responseJSON.backLink=`#articles/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.editLink=
                  `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.deleteLink=
                  `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article").innerHTML,
                        responseJSON
                    );
            }
        } else {
            const errMsgObj = {errMessage:this.responseText};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        }
        
    }

    console.log(url)
    var ajax = new XMLHttpRequest(); 
    ajax.addEventListener("load", reqListener); 
    ajax.open("GET", url, true); 
    ajax.send();
} 

function comments(targetElm, id, offset) {
    if (!offset) {
        offset = 0;
    }

    const serverUrl = "https://wt.kpi.fei.tuke.sk/api/article";

    fetch(serverUrl + '/' + id + '/comment?max=10&offset=' + offset).then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(new Error(`Failed to access the list of articles. Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
        }
    }).then((dataJson) => {
        dataJson['offset'] = offset;

        let totalCount = dataJson['meta']['totalCount'];
        if (offset > 0) {
            dataJson['offsetPrev'] = Math.max(offset - 20, 0);
        }

        dataJson['isPrev'] = offset > 0;


        if (totalCount > (offset + 20)) {
            dataJson['offsetNext'] = offset + 20;
        }

        document.getElementById(targetElm).innerHTML =
            Mustache.render(document.getElementById("template-comments").innerHTML, dataJson);

    }).catch(error => { ////here we process all the failed promises
        const errMsgObj = {errMessage: error};
        document.getElementById(targetElm).innerHTML =
            Mustache.render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
            );
    });
}

function addComment(targetElm, id) {
    document.getElementById(targetElm).innerHTML = document.getElementById("template-comments-add").innerHTML;

    document.getElementById('commentFrm').addEventListener('submit', function (e) {
        e.preventDefault();

        let myFrmElm = document.getElementById("commentFrm");

        let commentFrm = {};

        for (let i = 0; i < myFrmElm.elements.length; i++) {
            let elem = myFrmElm.elements[i];
            if (!elem.name) {
                continue;
            }
            commentFrm[elem.name] = elem.value;
        }

        commentFrm['author'] = commentFrm['name'] + ' ' + commentFrm['surname'];
        delete commentFrm['name'];
        delete commentFrm['surname'];


        //validácia
        var wasMistake = false;

        for (let i = 0; i < myFrmElm.elements.length; i++) {
            let elem = myFrmElm.elements[i];
            if (!elem.required) {
                continue;
            }

            if (elem.value == '') {
                wasMistake = true;
                elem.parentElement.getElementsByClassName('error-input')[0].style.display = "block";
            } else {
                elem.parentElement.getElementsByClassName('error-input')[0].style.display = "none";
            }

        }

        if (wasMistake) {
            return false;
        }


        const serverUrl = "https://wt.kpi.fei.tuke.sk/api/article";

        fetch(serverUrl + '/' + id + '/comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(commentFrm)
        }).then(function (response) {
            if (response.ok) {
                window.location.hash = "#artComment/" + id;
                comments(targetElm, id, 0);
            } else {
                return Promise.reject(new Error(`Failed to access the list of articles. Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        }).catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

    });
}