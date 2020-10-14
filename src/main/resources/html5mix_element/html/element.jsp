<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<c:if test="${renderContext.editMode}">
    <template:addResources type="css" resources="html5-edit.css"/>
</c:if>
<c:if test="${jcr:isNodeType(currentNode, 'html5mix:elementCustom')}">
    <c:set var="elementId" value="${currentNode.properties.elementId.string}"/>
    <c:set var="elementCssClass" value="${currentNode.properties.elementCssClass.string}"/>
    <c:set var="elementStyle" value="${currentNode.properties.elementStyle.string}"/>
    <c:set var="elementRole" value="${currentNode.properties.elementRole.string}"/>
    <c:set var="elementAria" value="${currentNode.properties.elementAria.string}"/>
    <c:set var="listLimit" value="${currentNode.properties.listLimit.string}"/>
</c:if>
<c:if test="${empty listLimit}">
    <c:set var="listLimit" value="-1"/>
</c:if>
<c:if test="${jcr:isNodeType(currentNode, 'html5mix:elementData')}">
    <c:set var="dataName" value="${currentNode.properties.dataName.string}"/>
    <c:set var="dataValue" value="${currentNode.properties.dataValue.string}"/>
    <c:if test="${! empty dataName && ! empty dataValue}">
        <c:set var="elementData">data-${dataName}="${fn:escapeXml(dataValue)}"</c:set>
    </c:if>
</c:if>
<c:if test="${jcr:isNodeType(currentNode, 'html5mix:elementData2')}">
    <c:set var="dataName2" value="${currentNode.properties.dataName2.string}"/>
    <c:set var="dataValue2" value="${currentNode.properties.dataValue2.string}"/>
    <c:if test="${! empty dataName2 && ! empty dataValue2}">
        <c:set var="elementData2">data-${dataName2}="${fn:escapeXml(dataValue2)}"</c:set>
    </c:if>

</c:if>
<c:if test="${jcr:isNodeType(currentNode, 'html5mix:elementData3')}">
    <c:set var="dataName3" value="${currentNode.properties.dataName3.string}"/>
    <c:set var="dataValue3" value="${currentNode.properties.dataValue3.string}"/>
    <c:if test="${! empty dataName3 && ! empty dataValue3}">
        <c:set var="elementData3">data-${dataName3}="${fn:escapeXml(dataValue3)}"</c:set>
    </c:if>
</c:if>

<c:if test="${renderContext.editMode}">
    <c:set var="elementCssClass" value="${elementCssClass} html5edit"/>
</c:if>
<c:set var="elementType" value="${fn:replace(currentNode.primaryNodeType,'html5nt:','')}"/>
<${elementType}<c:if test="${not empty elementId}"> id="${elementId}"</c:if><c:if
        test="${not empty elementCssClass}"><c:out value=" "/>class="${fn:escapeXml(elementCssClass)}"</c:if><c:if
        test="${not empty elementRole}"><c:out value=" "/>role="${fn:escapeXml(elementRole)}"</c:if><c:if
        test="${not empty elementStyle}"><c:out value=" "/>style="${elementStyle}"</c:if><c:if
        test="${not empty elementAria}"><c:out value=" "/>aria-label="${fn:escapeXml(elementAria)}"</c:if><c:if
        test="${not empty elementData}"><c:out value=" "/>${elementData}</c:if><c:if
        test="${not empty elementData2}"><c:out value=" "/>${elementData2}</c:if><c:if
        test="${not empty elementData3}"><c:out value=" "/>${elementData3}</c:if>>
    <template:area path="${elementType}" areaAsSubNode="true" listLimit="${listLimit}"/>
    <c:if test="${renderContext.editMode}">
        <div class="editbutton">
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
            </svg> ${elementType}
        </div>
    </c:if>
</${elementType}>
