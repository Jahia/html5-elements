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
<c:if test="${empty listLimit}">
    <c:set var="listLimit" value="-1"/>
</c:if>
<c:if test="${renderContext.editMode}">
    <c:set var="elementStyle" value="${elementStyle};position:relative;min-height:2.2em;padding-bottom:1em;"/>
</c:if>
<c:set var="elementType" value="${fn:replace(currentNode.primaryNodeType,'html5nt:','')}"/>
<${elementType}<c:if test="${not empty elementId}"> id="${elementId}"</c:if><c:if
        test="${not empty elementCssClass}"><c:out value=" "/>class="${fn:escapeXml(elementCssClass)}"</c:if><c:if
        test="${not empty elementRole}"><c:out value=" "/>role="${fn:escapeXml(elementRole)}"</c:if><c:if
        test="${not empty elementStyle}"><c:out value=" "/>style="${elementStyle}"</c:if><c:if
        test="${not empty elementAria}"><c:out value=" "/>aria-label="${fn:escapeXml(elementAria)}"</c:if>>
    <template:area path="${elementType}" areaAsSubNode="true" listLimit="${listLimit}"/>
    <c:if test="${renderContext.editMode}">
        <div style="position:absolute;bottom:1em;right:1em;height:1.2em;width:5em;opacity:.5;text-align: right;">
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
            </svg> ${elementType}
        </div>
    </c:if>
</${elementType}>
