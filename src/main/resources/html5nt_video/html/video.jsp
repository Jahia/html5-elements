<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>

<c:set var="source" value="${currentNode.properties.source}"/>
<jcr:nodeProperty node="${source.node}" name="jcr:mimeType" var="type" />
<c:url var="sourceUrl" value='${source.node.url}' context="/"/>

<c:if test="${jcr:isNodeType(currentNode, 'html5mix:videoAdvancedSettings')}">
    <c:set var="autoplay" value="${currentNode.properties.autoplay.boolean}"/>
    <c:set var="controls" value="${currentNode.properties.controls.boolean}"/>
    <c:set var="fallbackContent" value="${currentNode.properties.fallbackContent.string}"/>
    <c:set var="height" value="${currentNode.properties.height.string}"/>
    <c:set var="loop" value="${currentNode.properties.loop.boolean}"/>
    <c:set var="muted" value="${currentNode.properties.muted.boolean}"/>
    <c:set var="poster" value="${currentNode.properties.poster}"/>
    <c:set var="preload" value="${currentNode.properties.preload.string}"/>
    <c:set var="width" value="${currentNode.properties.width.string}"/>
</c:if>
<c:if test="${empty fallbackContent}">
    <fmt:message key="html5mix_videoAdvancedSettings.fallbackContent.value" var="fallbackContent"/>
    <c:set var="fallbackContent" value="${currentNode.properties.fallbackContent.string}"/>
</c:if>

<video<c:if test="${autoplay}"><c:out value=" "/>autoplay</c:if><c:if
        test="${controls}"><c:out value=" "/>controls</c:if><c:if
        test="${loop}"><c:out value=" "/>loop</c:if><c:if
        test="${muted}"><c:out value=" "/>muted</c:if><c:if
        test="${not empty poster}"><c:out value=" "/>poster="${poster.node.url}"</c:if><c:if
        test="${not empty preload}"><c:out value=" "/>preload="${fn:escapeXml(preload)}"</c:if><c:if
        test="${not empty height}"><c:out value=" "/>height="${fn:escapeXml(height)}"</c:if><c:if
        test="${not empty width}"><c:out value=" "/>width="${fn:escapeXml(width)}"</c:if>>
  <source src="${sourceUrl}" type="${type}">
  ${fallbackContent}
</video>
