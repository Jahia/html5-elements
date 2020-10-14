<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<c:if test="${jcr:isNodeType(currentNode, 'html5mix:elementCustom')}">
    <c:set var="elementId" value="${currentNode.properties['elementId'].string}"/>
    <c:set var="elementCssClass" value="${currentNode.properties['elementCssClass'].string}"/>
    <c:set var="elementStyle" value="${currentNode.properties['elementStyle'].string}"/>
    <c:set var="elementRole" value="${currentNode.properties['elementRole'].string}"/>
    <c:set var="elementAria" value="${currentNode.properties['elementAria'].string}"/>
    <c:set var="listLimit" value="${currentNode.properties.listLimit.string}"/>
</c:if>
<c:if test="${renderContext.editMode}">
    <c:set var="elementStyle" value="${elementStyle};position:relative;min-height:2.2em"/>
</c:if>
<c:set var="elementType" value="${fn:replace(currentNode.primaryNodeType,'html5nt:','')}"/>
<${elementType}<c:if test="${not empty elementId}"> id="${elementId}"</c:if><c:if
        test="${not empty elementCssClass}"><c:out value=" "/>class="${fn:escapeXml(elementCssClass)}"</c:if><c:if
        test="${not empty elementRole}"><c:out value=" "/>role="${fn:escapeXml(elementRole)}"</c:if><c:if
        test="${not empty elementStyle}"><c:out value=" "/>style="${elementStyle}"</c:if><c:if
        test="${not empty elementAria}"><c:out value=" "/>aria-label="${fn:escapeXml(elementAria)}"</c:if>>
    <template:area path="${elementType}" areaAsSubNode="true" listLimit="${listLimit}"/>
    <c:if test="${renderContext.editMode}">
        <div style="position:absolute;bottom:1em;right:1em;height:1em;width:1em;opacity:.7">
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
        </div>
    </c:if>
</${elementType}>
